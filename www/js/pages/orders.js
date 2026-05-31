const orders = {
  async render() {
    const lists = await DB.getAll('orders');
    lists.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    return `
    <div class="card">
      <h2>📋 ${t('order_lists')}</h2>
      <form onsubmit="orders.create(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">${t('new_order')}</h3>
        <div class="form-group">
          <label>${t('list_name')}</label>
          <input type="text" id="order-name" placeholder="${t('dept_placeholder')}" required>
        </div>
        <button type="submit" class="btn btn-primary">${t('add')}</button>
      </form>

      ${lists.length ? lists.map(list => {
        const total = (list.items||[]).length;
        const pending = (list.items||[]).filter(i => !i.checked).length;
        return `<div class="card" style="margin-bottom:12px;border:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <h3 style="font-size:16px;color:var(--heading)">${list.name}</h3>
              <p style="font-size:13px;color:var(--text-muted);margin-top:4px">${pending} ${t('pending_of')} ${total}</p>
            </div>
            <button class="btn btn-danger btn-sm" onclick="orders.del(${list.id})">✕</button>
          </div>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" onclick="orders.open(${list.id})">${t('view_list')}</button>
            <button class="btn btn-sm" style="background:#8e44ad" onclick="orders.share(${list.id})">📤 ${t('share_link')}</button>
          </div>
        </div>`;
      }).join('') : `<p style="color:var(--text-muted);text-align:center;padding:20px 0">${t('no_orders')}</p>`}
    </div>`;
  },

  async create(e) {
    e.preventDefault();
    await DB.add('orders', {
      name:      document.getElementById('order-name').value.trim(),
      items:     [],
      createdAt: new Date().toISOString()
    });
    App.nav('orders');
  },

  async del(id) {
    if (!confirm(t('delete') + '?')) return;
    await DB.delete('orders', id);
    App.nav('orders');
  },

  async open(id) {
    const list = await DB.get('orders', id);
    if (!list) return;
    document.getElementById('pageContainer').innerHTML = orders._detailHtml(list);
  },

  _detailHtml(list) {
    const items = list.items || [];
    const pending = items.filter(i => !i.checked);
    const done    = items.filter(i => i.checked);

    return `
    <div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <button class="btn btn-sm" onclick="App.nav('orders')">← ${t('back')}</button>
        <h2 style="margin-bottom:0">📋 ${list.name}</h2>
      </div>

      <form onsubmit="orders.addItem(event,${list.id})" style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
        <input type="text" id="item-name" placeholder="${t('item_name')}" style="flex:1;min-width:160px" required>
        <input type="number" id="item-qty" value="1" min="1" style="width:80px">
        <button type="submit" class="btn btn-success">${t('add')}</button>
      </form>

      ${pending.length ? `<h3 style="font-size:15px;color:var(--heading);margin-bottom:10px">${t('pending')} (${pending.length})</h3>
      ${pending.map(item => `<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
        <button class="circle-btn" onclick="orders.toggle(${list.id},${item.idx})">○</button>
        <span style="flex:1">${item.name}${item.qty > 1 ? ` <span style="color:var(--text-muted)">×${item.qty}</span>` : ''}</span>
        <button class="btn btn-danger btn-sm" onclick="orders.removeItem(${list.id},${item.idx})">✕</button>
      </div>`).join('')}` : ''}

      ${done.length ? `<h3 style="font-size:15px;color:var(--text-muted);margin-top:20px;margin-bottom:10px">${t('done')} (${done.length})</h3>
      ${done.map(item => `<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);opacity:0.6">
        <button class="circle-btn checked" onclick="orders.toggle(${list.id},${item.idx})">✓</button>
        <span style="flex:1;text-decoration:line-through">${item.name}${item.qty > 1 ? ` ×${item.qty}` : ''}</span>
        <button class="btn btn-danger btn-sm" onclick="orders.removeItem(${list.id},${item.idx})">✕</button>
      </div>`).join('')}` : ''}

      ${!items.length ? `<p style="color:var(--text-muted);text-align:center;padding:30px 0">${t('no_items')}</p>` : ''}
    </div>`;
  },

  async addItem(e, listId) {
    e.preventDefault();
    const list = await DB.get('orders', listId);
    const items = list.items || [];
    items.push({
      idx:     Date.now(),
      name:    document.getElementById('item-name').value.trim(),
      qty:     +document.getElementById('item-qty').value || 1,
      checked: false,
      addedAt: new Date().toISOString()
    });
    await DB.put('orders', { ...list, items });
    const updated = await DB.get('orders', listId);
    document.getElementById('pageContainer').innerHTML = orders._detailHtml(updated);
  },

  async toggle(listId, idx) {
    const list = await DB.get('orders', listId);
    const items = (list.items || []).map(i => i.idx === idx ? {...i, checked: !i.checked} : i);
    await DB.put('orders', { ...list, items });
    const updated = await DB.get('orders', listId);
    document.getElementById('pageContainer').innerHTML = orders._detailHtml(updated);
  },

  async removeItem(listId, idx) {
    const list = await DB.get('orders', listId);
    const items = (list.items || []).filter(i => i.idx !== idx);
    await DB.put('orders', { ...list, items });
    const updated = await DB.get('orders', listId);
    document.getElementById('pageContainer').innerHTML = orders._detailHtml(updated);
  },

  async share(id) {
    const list = await DB.get('orders', id);
    if (!list) return;
    const items = (list.items || []).filter(i => !i.checked);
    const text = `📋 ${list.name}\n\n` +
      (items.length ? items.map(i => `• ${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join('\n') : t('no_items'));
    if (navigator.share) {
      navigator.share({ title: list.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Copied!')).catch(() => alert(text));
    }
  }
};
