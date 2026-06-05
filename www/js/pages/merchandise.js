const merchandise = {
  async render() {
    const [purchases, vendors] = await Promise.all([DB.getAll('merchandise'), DB.getAll('vendors')]);
    const total = purchases.reduce((s, m) => s + (+m.amount), 0);
    const groups = {};
    [...purchases].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(m => {
      (groups[m.vendorName] = groups[m.vendorName] || []).push(m);
    });

    const groupCards = Object.entries(groups).map(([vendor, items]) => {
      const vt = items.reduce((s, m) => s + (+m.amount), 0);
      return `<div class="rise"><div class="card flush" style="padding:6px 16px 8px">
        <div class="row">
          ${App.iconChip('store', 'neutral')}
          <div class="r-main"><div class="r-title" style="font-weight:680">${App.esc(vendor)}</div></div>
          <span class="money c-info" style="font-size:15.5px">${App.fmtMoney(vt)}</span>
        </div>
        ${items.map(m => `<div class="row">
          ${m.receiptDataUrl || m.receipt ? `<div class="receipt-thumb">${icon('receipt', { size: 18 })}</div>` : '<span style="font-size:13px;color:var(--faint);width:40px;text-align:center">—</span>'}
          <div class="r-main"><div class="r-title">${App.fmtMoney(m.amount)}</div><div class="r-sub">${App.fmtDateShort(m.date)}${m.notes ? ' · ' + App.esc(m.notes) : ''}</div></div>
          <button class="icon-btn" onclick="merchandise.del(${m.id})">${icon('trash', { size: 16 })}</button>
        </div>`).join('')}
      </div></div>`;
    }).join('');

    return `<div class="page">
      <div class="card rise" style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><div class="metric-label">${t('total_spent')}</div>
          <span class="money c-text" style="font-size:32px;display:block;margin-top:6px">${App.fmtMoney(total)}</span></div>
        <div class="iconchip t-info" style="width:42px;height:42px">${icon('merchandise', { size: 22 })}</div>
      </div>

      <button class="btn btn-brand btn-full" onclick="App.openForm('merch')">${icon('plus', { size: 18 })}${t('add_purchase')}</button>

      ${purchases.length ? groupCards : `<div class="card">${App.emptyState('merchandise', 'no_purchases')}</div>`}

      <div class="rise">
        ${App.sectionHead('manage_stores')}
        <div class="card">
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${vendors.length ? vendors.map(v => `<span class="pill">${App.esc(v.name)}
              <span class="tap" onclick="merchandise.delVendor(${v.id})" style="color:var(--faint);display:flex">${icon('close', { size: 15, stroke: 2.2 })}</span></span>`).join('')
              : `<span style="font-size:13.5px;color:var(--faint)">${t('no_stores')}</span>`}
          </div>
          <div style="display:flex;gap:10px;margin-top:14px">
            <input class="in" id="vendor-name" placeholder="${t('store_name')}" style="flex:1">
            <button class="btn btn-soft" onclick="merchandise.addVendor()">${icon('plus', { size: 16 })}${t('add')}</button>
          </div>
        </div>
      </div>
    </div>`;
  },

  formHTML() {
    // Merch form needs vendors loaded first — see openAddForm() / App.openForm('merch').
    return this._formBody();
  },

  // Build the form synchronously from a cached vendor list
  _vendors: [],
  async openAddForm() {
    this._vendors = await DB.getAll('vendors');
    App.openSheet({ title: t('add_purchase'), body: this._formBody(), onMount: () => {} });
  },
  _formBody() {
    const opts = this._vendors.map(v => `<option value="${v.id}">${App.esc(v.name)}</option>`).join('');
    return `<div style="padding-bottom:8px">
      <div class="field"><label class="lbl">${t('store_vendor')}</label>
        <select class="in" id="merch-vendor">${opts || `<option value="">${t('select_store')}</option>`}</select></div>
      <div class="grid-2">
        <div class="field"><label class="lbl">${t('date')}</label><input class="in" type="date" id="merch-date" value="${App.mondayISO()}"></div>
        <div class="field"><label class="lbl">${t('amount')}</label>${App.moneyField('merch-amount')}</div>
      </div>
      <div class="field"><label class="lbl">${t('notes')}</label><input class="in" id="merch-notes" placeholder="…"></div>
      <div class="field"><label class="lbl">${t('receipt_photo')}</label>
        <button type="button" id="merch-receipt" data-on="1" onclick="merchandise.toggleReceipt()"
          style="width:100%;border:1.5px dashed var(--border);border-radius:13px;padding:16px;background:var(--brand-soft);color:var(--brand-ink);display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;font-weight:600;font-size:14px">
          ${icon('check', { size: 19 })}<span>${t('receipt')} ✓</span></button></div>
      <button class="btn btn-brand btn-full" onclick="merchandise.add()">${icon('check', { size: 18 })}${t('save')}</button>
    </div>`;
  },
  toggleReceipt() {
    const b = document.getElementById('merch-receipt');
    const on = b.dataset.on === '1' ? '0' : '1';
    b.dataset.on = on;
    b.style.background = on === '1' ? 'var(--brand-soft)' : 'var(--surface-2)';
    b.style.color = on === '1' ? 'var(--brand-ink)' : 'var(--muted)';
    b.innerHTML = on === '1' ? `${icon('check', { size: 19 })}<span>${t('receipt')} ✓</span>` : `${icon('camera', { size: 19 })}<span>${t('receipt_photo')}</span>`;
  },
  async add() {
    const vid = +document.getElementById('merch-vendor').value;
    const amount = App.readMoney('merch-amount');
    if (!vid || !amount) return;
    const v = this._vendors.find(x => x.id === vid);
    await DB.add('merchandise', {
      vendorId: vid, vendorName: v ? v.name : '',
      date: document.getElementById('merch-date').value, amount,
      notes: document.getElementById('merch-notes').value,
      receipt: document.getElementById('merch-receipt').dataset.on === '1',
      receiptDataUrl: null, createdAt: new Date().toISOString(),
    });
    App.closeSheet(); App.refresh(); App.toast(t('save'));
  },
  async del(id) { await DB.delete('merchandise', id); App.refresh(); },
  async addVendor() {
    const el = document.getElementById('vendor-name');
    const name = el.value.trim();
    if (!name) return;
    await DB.add('vendors', { name, createdAt: new Date().toISOString() });
    App.refresh();
  },
  async delVendor(id) { await DB.delete('vendors', id); App.refresh(); },
};
