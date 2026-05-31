const revenue = {
  async render() {
    const rows = await DB.getAll('revenue');
    rows.sort((a,b) => new Date(b.weekStart) - new Date(a.weekStart));
    const total      = rows.reduce((s,r) => s + (+r.amount), 0);
    const totalCash  = rows.reduce((s,r) => s + (+r.cash || 0), 0);
    const totalCredit= rows.reduce((s,r) => s + (+r.credit || 0), 0);

    const today = new Date();
    const mon = new Date(today);
    mon.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const defaultWeek = mon.toISOString().slice(0,10);

    return `
    <div class="card">
      <h2>💵 ${t('revenue')}</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        <div class="stat-card revenue"><h3>${t('total_all_time')}</h3><div class="value">${App.fmtMoney(total)}</div></div>
        <div class="stat-card" style="background:linear-gradient(135deg,#11998e,#38ef7d)"><h3>💵 ${t('cash')}</h3><div class="value">${App.fmtMoney(totalCash)}</div></div>
        <div class="stat-card" style="background:linear-gradient(135deg,#4facfe,#00f2fe)"><h3>💳 ${t('credit_card')}</h3><div class="value">${App.fmtMoney(totalCredit)}</div></div>
      </div>

      <form onsubmit="revenue.add(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">${t('add_revenue')}</h3>
        <div class="form-group">
          <label>${t('week_starting')}</label>
          <input type="date" id="rev-week" value="${defaultWeek}" required>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label>💵 ${t('cash')} ($)</label>
            <input type="number" id="rev-cash" step="0.01" min="0" placeholder="0.00" oninput="revenue.calcTotal()">
          </div>
          <div class="form-group">
            <label>💳 ${t('credit_card')} ($)</label>
            <input type="number" id="rev-credit" step="0.01" min="0" placeholder="0.00" oninput="revenue.calcTotal()">
          </div>
        </div>
        <div style="background:var(--th-bg);border-radius:8px;padding:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:600;color:var(--heading)">${t('total')}</span>
          <span id="rev-total-display" style="font-size:20px;font-weight:700;color:#27ae60">$0.00</span>
        </div>
        <div class="form-group">
          <label>${t('notes')}</label>
          <input type="text" id="rev-notes" placeholder="…">
        </div>
        <button type="submit" class="btn btn-success" style="width:100%">${t('save_revenue')}</button>
      </form>

      ${rows.length ? `<table><thead><tr>
        <th>${t('date')}</th>
        <th>💵 ${t('cash')}</th>
        <th>💳 ${t('credit_card')}</th>
        <th>${t('total')}</th>
        <th></th>
      </tr></thead><tbody>
        ${rows.map(r=>`<tr>
          <td>${App.fmtDate(r.weekStart)}</td>
          <td style="color:#27ae60">${App.fmtMoney(r.cash || 0)}</td>
          <td style="color:#2980b9">${App.fmtMoney(r.credit || 0)}</td>
          <td style="font-weight:700">${App.fmtMoney(r.amount)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="revenue.del(${r.id})">✕</button></td>
        </tr>`).join('')}
      </tbody></table>` : `<p style="color:var(--text-muted);text-align:center;padding:20px 0">${t('no_revenue')}</p>`}
    </div>`;
  },

  calcTotal() {
    const cash   = +document.getElementById('rev-cash').value   || 0;
    const credit = +document.getElementById('rev-credit').value || 0;
    document.getElementById('rev-total-display').textContent = App.fmtMoney(cash + credit);
  },

  async add(e) {
    e.preventDefault();
    const cash   = +document.getElementById('rev-cash').value   || 0;
    const credit = +document.getElementById('rev-credit').value || 0;
    if (cash === 0 && credit === 0) {
      alert('Please enter a cash or credit amount.');
      return;
    }
    await DB.add('revenue', {
      weekStart: document.getElementById('rev-week').value,
      cash,
      credit,
      amount:    cash + credit,
      notes:     document.getElementById('rev-notes').value,
      createdAt: new Date().toISOString()
    });
    App.nav('revenue');
  },

  async del(id) {
    if (!confirm(t('delete') + '?')) return;
    await DB.delete('revenue', id);
    App.nav('revenue');
  }
};
