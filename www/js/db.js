// ── IndexedDB wrapper — all data lives on the device ─────────────────────────
const DB = (() => {
  const DB_NAME = 'StoreLedger';
  const DB_VER  = 1;
  let _db = null;
  let _firestore = null;
  const _unsubs = {};

  const STORES = {
    users:       { keyPath: 'id', autoIncrement: true },
    revenue:     { keyPath: 'id', autoIncrement: true },
    expenses:    { keyPath: 'id', autoIncrement: true },
    merchandise: { keyPath: 'id', autoIncrement: true },
    vendors:     { keyPath: 'id', autoIncrement: true },
    employees:   { keyPath: 'id', autoIncrement: true },
    deductions:  { keyPath: 'id', autoIncrement: true },
    orders:      { keyPath: 'id', autoIncrement: true },
    order_items: { keyPath: 'id', autoIncrement: true },
  };

  async function open() {
    if (Auth && Auth.isConfigured()) {
      await Auth.init();
      _firestore = Auth.db();
      return _firestore;
    }
    if (_db) return _db;
    return new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        for (const [name, opts] of Object.entries(STORES)) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, opts);
          }
        }
      };
      req.onsuccess = e => { _db = e.target.result; res(_db); };
      req.onerror  = e => rej(e.target.error);
    });
  }

  async function tx(store, mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const t  = db.transaction(store, mode);
      const s  = t.objectStore(store);
      const req = fn(s);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  }

  async function getAll(store) {
    if (Auth && Auth.isConfigured()) {
      await open();
      const snap = await _firestore.collection(store).get();
      return snap.docs.map(docToRow);
    }
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, 'readonly');
      const s = t.objectStore(store);
      const req = s.getAll();
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  }

  function makeId() {
    return Date.now() + Math.floor(Math.random() * 100000);
  }

  function docToRow(doc) {
    const data = doc.data() || {};
    const numeric = Number(doc.id);
    return { id: Number.isFinite(numeric) ? numeric : doc.id, ...data };
  }

  async function getFirebase(store, id) {
    await open();
    const doc = await _firestore.collection(store).doc(String(id)).get();
    return doc.exists ? docToRow(doc) : undefined;
  }

  async function addFirebase(store, data) {
    await open();
    const id = data && data.id ? data.id : makeId();
    await _firestore.collection(store).doc(String(id)).set({ ...data, id });
    return id;
  }

  async function putFirebase(store, data) {
    await open();
    const id = data && data.id ? data.id : makeId();
    await _firestore.collection(store).doc(String(id)).set({ ...data, id }, { merge: true });
    return id;
  }

  async function deleteFirebase(store, id) {
    await open();
    await _firestore.collection(store).doc(String(id)).delete();
  }

  async function clearFirebaseStore(store) {
    const rows = await getAll(store);
    await Promise.all(rows.map(row => deleteFirebase(store, row.id)));
  }

  return {
    open,
    getAll,
    get:    (store, id)   => Auth && Auth.isConfigured() ? getFirebase(store, id) : tx(store, 'readonly',  s => s.get(id)),
    add:    (store, data) => Auth && Auth.isConfigured() ? addFirebase(store, data) : tx(store, 'readwrite', s => s.add(data)),
    put:    (store, data) => Auth && Auth.isConfigured() ? putFirebase(store, data) : tx(store, 'readwrite', s => s.put(data)),
    delete: (store, id)   => Auth && Auth.isConfigured() ? deleteFirebase(store, id) : tx(store, 'readwrite', s => s.delete(id)),

    subscribe(store, cb) {
      if (!(Auth && Auth.isConfigured())) return () => {};
      open().then(() => {
        if (_unsubs[store]) _unsubs[store]();
        _unsubs[store] = _firestore.collection(store).onSnapshot(() => cb && cb());
      });
      return () => { if (_unsubs[store]) _unsubs[store](); };
    },

    // Seed default admin if no users exist
    async seedAdmin() {
      if (Auth && Auth.isConfigured()) return;
      const users = await this.getAll('users');
      if (users.length === 0) {
        await this.add('users', {
          username: 'admin',
          name: 'Owner',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date().toISOString()
        });
        console.log('Default admin created: admin / admin123');
      }
    },

    // ── Optional sample data (opt-in, anchored to the current week) ──────────
    // Call from Settings → "Load sample data". Non-destructive: only fills
    // stores that are empty so it never clobbers real entries.
    async seedDemo() {
      const iso = d => d.toISOString().slice(0, 10);
      const now = new Date();
      const mon = new Date(now);
      mon.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      const wk = n => { const d = new Date(mon); d.setDate(mon.getDate() - 7 * n); return iso(d); };

      if ((await this.getAll('revenue')).length === 0) {
        const rev = [
          { cash: 4820.50, credit: 6190.25, w: 0, notes: 'Holiday weekend traffic' },
          { cash: 4510.00, credit: 5980.40, w: 1, notes: '' },
          { cash: 5120.75, credit: 6340.00, w: 2, notes: 'Lottery payout week' },
          { cash: 4390.20, credit: 5870.10, w: 3, notes: '' },
          { cash: 4205.00, credit: 5610.50, w: 4, notes: '' },
        ];
        for (const r of rev) await this.add('revenue', {
          weekStart: wk(r.w), cash: r.cash, credit: r.credit,
          amount: r.cash + r.credit, notes: r.notes, createdAt: new Date().toISOString(),
        });
      }
      if ((await this.getAll('expenses')).length === 0) {
        const exp = [
          { d: iso(new Date(mon.getTime() + 864e5)), desc: 'Refrigeration repair', amt: 340, rec: false },
          { d: iso(new Date(mon.getTime() + 2 * 864e5)), desc: 'Cleaning supplies', amt: 76.40, rec: false },
          { d: iso(mon), desc: 'Health permit renewal', amt: 125, rec: false },
          { d: iso(mon), desc: 'Rent', amt: 4200, rec: true, day: 1 },
          { d: iso(mon), desc: 'Con Edison — electric', amt: 680, rec: true, day: 12 },
          { d: iso(mon), desc: 'National Grid — gas', amt: 240, rec: true, day: 15 },
          { d: iso(mon), desc: 'Liability insurance', amt: 510, rec: true, day: 20 },
          { d: iso(mon), desc: 'Clover POS fees', amt: 89, rec: true, day: 8 },
          { d: iso(mon), desc: 'Optimum internet', amt: 120, rec: true, day: 10 },
        ];
        for (const e of exp) await this.add('expenses', {
          date: e.d, description: e.desc, amount: e.amt,
          isRecurring: e.rec, recurringDay: e.rec ? e.day : null, createdAt: new Date().toISOString(),
        });
      }
      let vendorIds = (await this.getAll('vendors')).map(v => v.id);
      if (vendorIds.length === 0) {
        for (const n of ['Jetro / Restaurant Depot', "Boar's Head Dist.", 'Coca-Cola Bottling', 'Krasdale Foods'])
          vendorIds.push(await this.add('vendors', { name: n, createdAt: new Date().toISOString() }));
      }
      if ((await this.getAll('merchandise')).length === 0) {
        const vs = await this.getAll('vendors');
        const byName = n => vs.find(v => v.name === n) || vs[0];
        const m = [
          ['Jetro / Restaurant Depot', 0, 1840.60, 'Dry goods + paper'],
          ["Boar's Head Dist.", 1, 760.00, 'Cold cuts'],
          ['Coca-Cola Bottling', 1, 410.50, 'Beverages'],
          ['Krasdale Foods', -1, 1130.75, 'Grocery restock'],
        ];
        for (const [name, off, amt, notes] of m) {
          const v = byName(name);
          await this.add('merchandise', {
            vendorId: v.id, vendorName: v.name,
            date: iso(new Date(mon.getTime() + off * 864e5)),
            amount: amt, notes, receiptDataUrl: null, createdAt: new Date().toISOString(),
          });
        }
      }
      if ((await this.getAll('employees')).length === 0) {
        const emps = [['María López', 720], ['Carlos Méndez', 680], ['Ana Rivera', 640], ['Diego Santos', 600], ['Luis Ortiz', 560]];
        const ids = [];
        for (const [name, pay] of emps) ids.push(await this.add('employees', { name, weeklyPay: pay, createdAt: new Date().toISOString() }));
        await this.add('deductions', { employeeId: ids[0], employeeName: 'María López', description: 'Pay advance', amount: 100, createdAt: new Date().toISOString() });
        await this.add('deductions', { employeeId: ids[3], employeeName: 'Diego Santos', description: 'Uniform', amount: 40, createdAt: new Date().toISOString() });
      }
      if ((await this.getAll('orders')).length === 0) {
        const lists = [
          { name: 'Deli', items: [['Boar\'s Head ham', 4, false], ['Provolone', 3, false], ['Hero rolls', 6, true], ['Mayonnaise', 2, false], ['Pickles', 1, true]] },
          { name: 'Produce', items: [['Tomatoes (case)', 10, false], ['Lettuce', 8, false], ['Onions (sack)', 5, true], ['Avocados', 12, false]] },
          { name: 'Bakery', items: [['Bolillo', 20, true], ['Conchas', 15, true], ['Flour 50lb', 2, false]] },
        ];
        for (const l of lists) await this.add('orders', {
          name: l.name, createdAt: new Date().toISOString(),
          items: l.items.map((it, i) => ({ idx: Date.now() + i, name: it[0], qty: it[1], checked: it[2], addedAt: new Date().toISOString() })),
        });
      }
    },

    // Wipe every store (Settings → "Reset data"). Keeps the schema.
    async clearAll() {
      if (Auth && Auth.isConfigured()) {
        await Promise.all(Object.keys(STORES).map(clearFirebaseStore));
        return;
      }
      const db = await open();
      const names = Array.from(db.objectStoreNames);
      return new Promise((res, rej) => {
        const t = db.transaction(names, 'readwrite');
        for (const n of names) t.objectStore(n).clear();
        t.oncomplete = () => res();
        t.onerror = e => rej(e.target.error);
      });
    }
  };
})();
