// ── IndexedDB wrapper — all data lives on the device ─────────────────────────
const DB = (() => {
  const DB_NAME = 'StoreLedger';
  const DB_VER  = 1;
  let _db = null;

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
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, 'readonly');
      const s = t.objectStore(store);
      const req = s.getAll();
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  }

  return {
    open,
    getAll,
    get:    (store, id)   => tx(store, 'readonly',  s => s.get(id)),
    add:    (store, data) => tx(store, 'readwrite', s => s.add(data)),
    put:    (store, data) => tx(store, 'readwrite', s => s.put(data)),
    delete: (store, id)   => tx(store, 'readwrite', s => s.delete(id)),

    // Seed default admin if no users exist
    async seedAdmin() {
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
    }
  };
})();
