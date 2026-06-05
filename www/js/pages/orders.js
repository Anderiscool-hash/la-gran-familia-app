const orders = {
  async render() {
    const lists = (await DB.getAll('orders')).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return `<div class="page">
      <button class="btn btn-brand btn-full" onclick="App.openForm('list')">${icon('plus', { size: 18 })}${t('new_list')}</button>
      ${lists.length ? lists.map(l => {
        const items = l.items || [];
        const done = items.filter(i => i.checked).length;
        const pct = items.length ? done / items.length : 0;
        return `<div class="card tap rise" onclick="orders.open(${l.id})">
          <div style="display:flex;align-items:center;gap:14px">
            ${ringSVG(pct)}
            <div style="flex:1;min-width:0">
              <div style="font-size:16.5px;font-weight:680">${App.esc(l.name)}</div>
              <div style="font-size:13px;color:var(--muted);margin-top:2px">${items.length - done} ${t('pending_of')} · ${items.length} ${t('items')}</div>
            </div>
            <button class="icon-btn bordered" onclick="event.stopPropagation();orders.share(${l.id})">${icon('share', { size: 18 })}</button>
            ${icon('chevronRight', { size: 18, cls: 'c-faint' })}
          </div>
        </div>`;
      }).join('') : `<div class="card">${App.emptyState('orders', 'no_orders')}</div>`}
    </div>`;
  },

  formHTML() {
    return `<div style="padding-bottom:8px">
      <div class="field"><label class="lbl">${t('list_name')}</label><input class="in" id="list-name" placeholder="${t('dept_placeholder')}"></div>
      <button class="btn btn-brand btn-full" onclick="orders.create()">${icon('check', { size: 18 })}${t('new_list')}</button>
    </div>`;
  },
  async create() {
    const name = document.getElementById('list-name').value.trim();
    if (!name) return;
    const id = await DB.add('orders', { name, items: [], createdAt: new Date().toISOString() });
    App.closeSheet();
    this.open(id);
  },

  async open(id) {
    App.openDetail({
      title: t('orders'), parentTab: 'orders',
      action: `<button class="hdr-btn" onclick="orders.share(${id})">${icon('share', { size: 18 })}</button>`,
      render: () => this._detail(id),
    });
  },

  async _detail(id) {
    const list = (await DB.getAll('orders')).find(l => l.id === id);
    if (!list) return `<div class="page">${App.emptyState('orders', 'no_orders')}</div>`;
    const items = list.items || [];
    const pending = items.filter(i => !i.checked);
    const done = items.filter(i => i.checked);
    const itemRow = it => `<div class="row">
      <button class="check-circle ${it.checked ? 'on' : ''}" onclick="orders.toggle(${id},${it.idx})">${it.checked ? icon('check', { size: 16, stroke: 2.6 }) : ''}</button>
      <span style="flex:1;font-size:15px;font-weight:500;color:${it.checked ? 'var(--faint)' : 'var(--text)'};${it.checked ? 'text-decoration:line-through' : ''}">${App.esc(it.name)}</span>
      ${it.qty > 1 ? `<span class="num" style="font-size:13px;font-weight:600;color:var(--muted);background:var(--sunken);border-radius:7px;padding:3px 8px">×${it.qty}</span>` : ''}
      <button class="icon-btn" onclick="orders.removeItem(${id},${it.idx})">${icon('trash', { size: 16 })}</button>
    </div>`;

    return `<div class="page" data-list="${id}">
      <div class="card rise" style="font-weight:680;font-size:17px">${App.esc(list.name)}</div>
      <div class="card rise">
        <div style="display:flex;gap:10px;align-items:flex-end">
          <div style="flex:1"><label class="lbl">${t('item_name')}</label><input class="in" id="item-name" placeholder="…"></div>
          <div><label class="lbl">${t('qty')}</label>
            <div style="display:flex;align-items:center;gap:8px">
              <button class="icon-btn bordered" onclick="orders.stepQty(-1)">${icon('chevronLeft', { size: 16, stroke: 2.2 })}</button>
              <span class="num" id="item-qty" style="min-width:24px;text-align:center;font-weight:600;font-size:16px">1</span>
              <button class="icon-btn bordered" onclick="orders.stepQty(1)">${icon('chevronRight', { size: 16, stroke: 2.2 })}</button>
            </div></div>
        </div>
        <button class="btn btn-brand btn-full" style="margin-top:14px" onclick="orders.addItem(${id})">${icon('plus', { size: 18 })}${t('add_item')}</button>
      </div>
      ${pending.length ? `<div class="rise"><div class="section-head"><div class="s-title">${t('pending')} · ${pending.length}</div></div>
        <div class="card flush">${pending.map(itemRow).join('')}</div></div>` : ''}
      ${done.length ? `<div class="rise"><div class="section-head"><div class="s-title">${t('done')} · ${done.length}</div></div>
        <div class="card flush" style="opacity:.85">${done.map(itemRow).join('')}</div></div>` : ''}
      ${items.length === 0 ? `<div class="card">${App.emptyState('orders', 'no_items')}</div>` : ''}
      <button class="btn btn-ghost btn-full" onclick="orders.share(${id})">${icon('share', { size: 18 })}${t('share_list')}</button>
    </div>`;
  },

  _qty: 1,
  stepQty(d) { this._qty = Math.max(1, this._qty + d); document.getElementById('item-qty').textContent = this._qty; },
  async addItem(id) {
    const name = document.getElementById('item-name').value.trim();
    if (!name) return;
    const list = (await DB.getAll('orders')).find(l => l.id === id);
    list.items = list.items || [];
    list.items.push({ idx: Date.now(), name, qty: this._qty, checked: false, addedAt: new Date().toISOString() });
    await DB.put('orders', list);
    this._qty = 1;
    App.refresh();
  },
  async toggle(id, idx) {
    const list = (await DB.getAll('orders')).find(l => l.id === id);
    const it = list.items.find(i => i.idx === idx);
    if (it) it.checked = !it.checked;
    await DB.put('orders', list);
    App.refresh();
  },
  async removeItem(id, idx) {
    const list = (await DB.getAll('orders')).find(l => l.id === id);
    list.items = list.items.filter(i => i.idx !== idx);
    await DB.put('orders', list);
    App.refresh();
  },
  async share(id) {
    const list = (await DB.getAll('orders')).find(l => l.id === id);
    const text = `${list.name}\n` + (list.items || []).map(i => `${i.checked ? '☑' : '☐'} ${i.name}${i.qty > 1 ? ' ×' + i.qty : ''}`).join('\n');
    try {
      if (navigator.share) await navigator.share({ title: list.name, text });
      else { await navigator.clipboard.writeText(text); App.toast(t('copied')); }
    } catch (e) { try { await navigator.clipboard.writeText(text); App.toast(t('copied')); } catch (_) {} }
  },
};

function ringSVG(pct) {
  const size = 44, sw = 5, r = (size - sw) / 2, c = 2 * Math.PI * r;
  return `<svg width="${size}" height="${size}" style="flex-shrink:0">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--sunken)" stroke-width="${sw}"></circle>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--brand)" stroke-width="${sw}" stroke-linecap="round"
      stroke-dasharray="${pct * c} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"></circle>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" style="font-family:var(--font-num);font-size:12px;font-weight:680;fill:var(--text)">${Math.round(pct * 100)}</text>
  </svg>`;
}
