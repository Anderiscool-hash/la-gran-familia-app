const merchandise = {
  async render() {
    const [purchases, vendors] = await Promise.all([DB.getAll('merchandise'), DB.getAll('vendors')]);
    purchases.sort((a,b) => new Date(b.date) - new Date(a.date));
    const total = purchases.reduce((s,p) => s + (+p.amount), 0);
    const today = new Date().toISOString().slice(0,10);

    const grouped = {};
    for (const p of purchases) {
      const vName = p.vendorName || 'Unknown';
      if (!grouped[vName]) grouped[vName] = [];
      grouped[vName].push(p);
    }

    return `
    <div class="card">
      <h2>🛍️ ${t('merchandise')}</h2>
      <div class="stat-card revenue" style="margin-bottom:16px">
        <h3>${t('total_spent')}</h3><div class="value">${App.fmtMoney(total)}</div>
      </div>

      <form onsubmit="merchandise.add(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">${t('add_purchase')}</h3>
        <div class="form-group">
          <label>${t('store_vendor')}</label>
          ${vendors.length ? `<select id="merch-vendor" required>
            <option value="">${t('select_store')}</option>
            ${vendors.map(v=>`<option value="${v.id}" data-name="${v.name}">${v.name}</option>`).join('')}
          </select>` : `<p style="color:#e74c3c;font-size:14px">${t('add_store_first')}</p>`}
        </div>
        <div class="form-group">
          <label>${t('date')}</label>
          <input type="date" id="merch-date" value="${today}" required>
        </div>
        <div class="form-group">
          <label>${t('amount')} ($)</label>
          <input type="number" id="merch-amount" step="0.01" min="0.01" placeholder="0.00" required>
        </div>
        <div class="form-group">
          <label>${t('receipt_photo')}</label>
          <input type="file" id="merch-receipt" accept="image/*" capture="environment" required onchange="merchandise.previewReceipt(this)">
          <img id="receiptPreview" src="" alt="Receipt preview">
        </div>
        <div class="form-group">
          <label>${t('notes')}</label>
          <input type="text" id="merch-notes" placeholder="…">
        </div>
        ${vendors.length ? `<button type="submit" class="btn btn-success">${t('save')}</button>` : ''}
      </form>
    </div>

    ${Object.keys(grouped).length ? Object.entries(grouped).map(([vName, items]) => {
      const vTotal = items.reduce((s,p) => s + (+p.amount), 0);
      return `<div class="card">
        <h2 style="display:flex;justify-content:space-between;align-items:center">
          <span>🏪 ${vName}</span>
          <span style="font-size:15px;color:#27ae60;font-weight:700">${App.fmtMoney(vTotal)}</span>
        </h2>
        <table><thead><tr><th>${t('date')}</th><th>${t('amount')}</th><th>${t('receipt_photo')}</th><th>${t('notes')}</th><th></th></tr></thead><tbody>
          ${items.map(p=>`<tr>
            <td>${App.fmtDate(p.date)}</td>
            <td style="color:#e67e22;font-weight:600">${App.fmtMoney(p.amount)}</td>
            <td>${p.receiptDataUrl ? `<img src="${p.receiptDataUrl}" style="height:40px;border-radius:4px;cursor:pointer" onclick="merchandise.viewReceipt('${p.id}')">` : '—'}</td>
            <td style="color:var(--text-muted)">${p.notes||'—'}</td>
            <td><button class="btn btn-danger btn-sm" onclick="merchandise.del(${p.id})">✕</button></td>
          </tr>`).join('')}
        </tbody></table>
      </div>`;
    }).join('') : ''}

    <div class="card">
      <h2>🏪 ${t('manage_stores')}</h2>
      <form onsubmit="merchandise.addVendor(event)" style="display:flex;gap:10px;margin-bottom:16px">
        <input type="text" id="vendor-name" placeholder="${t('store_name')}" style="flex:1" required>
        <button type="submit" class="btn btn-primary">${t('add')}</button>
      </form>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${vendors.map(v=>`<span style="background:var(--surface-alt);border:1px solid var(--border);border-radius:20px;padding:6px 14px;font-size:14px;display:flex;align-items:center;gap:8px">
          ${v.name}
          <button onclick="merchandise.delVendor(${v.id})" style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:16px;padding:0;line-height:1">×</button>
        </span>`).join('') || `<p style="color:var(--text-muted)">${t('no_stores')}</p>`}
      </div>
    </div>

    <div id="receipt-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:1000;align-items:center;justify-content:center" onclick="merchandise.closeReceipt()">
      <img id="receipt-modal-img" src="" style="max-width:90vw;max-height:90vh;border-radius:8px">
    </div>`;
  },

  previewReceipt(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('receiptPreview');
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  },

  async add(e) {
    e.preventDefault();
    const vendorSel = document.getElementById('merch-vendor');
    const vendorOpt = vendorSel.options[vendorSel.selectedIndex];
    const file = document.getElementById('merch-receipt').files[0];
    let receiptDataUrl = null;
    if (file) {
      receiptDataUrl = await new Promise(res => {
        const r = new FileReader();
        r.onload = ev => res(ev.target.result);
        r.readAsDataURL(file);
      });
    }
    await DB.add('merchandise', {
      vendorId:      +vendorSel.value,
      vendorName:    vendorOpt.dataset.name,
      date:          document.getElementById('merch-date').value,
      amount:        +document.getElementById('merch-amount').value,
      notes:         document.getElementById('merch-notes').value,
      receiptDataUrl,
      createdAt:     new Date().toISOString()
    });
    App.nav('merchandise');
  },

  async del(id) {
    if (!confirm(t('delete') + '?')) return;
    await DB.delete('merchandise', id);
    App.nav('merchandise');
  },

  async addVendor(e) {
    e.preventDefault();
    const name = document.getElementById('vendor-name').value.trim();
    const vendors = await DB.getAll('vendors');
    if (vendors.some(v => v.name.toLowerCase() === name.toLowerCase())) { alert(t('store_name') + ' exists.'); return; }
    await DB.add('vendors', { name, createdAt: new Date().toISOString() });
    App.nav('merchandise');
  },

  async delVendor(id) {
    if (!confirm(t('delete') + '?')) return;
    await DB.delete('vendors', id);
    App.nav('merchandise');
  },

  async viewReceipt(id) {
    const modal = document.getElementById('receipt-modal');
    const all = await DB.getAll('merchandise');
    const item = all.find(p => String(p.id) === String(id));
    if (item?.receiptDataUrl) {
      document.getElementById('receipt-modal-img').src = item.receiptDataUrl;
      modal.style.display = 'flex';
    }
  },

  closeReceipt() {
    document.getElementById('receipt-modal').style.display = 'none';
  }
};
