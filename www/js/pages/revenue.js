const revenue = {
  async render() {
    const rows = await DB.getAll('revenue');
    rows.sort((a,b)=>new Date(b.weekStart)-new Date(a.weekStart));
    const total = rows.reduce((s,r)=>s+(+r.amount),0);

    const today = new Date();
    const mon = new Date(today);
    mon.setDate(today.getDate()-today.getDay()+(today.getDay()===0?-6:1));
    const defaultWeek = mon.toISOString().slice(0,10);

    return `
    <div class="card">
      <h2>💵 Revenue</h2>
      <div class="stat-card revenue" style="margin-bottom:16px">
        <h3>Total All-Time</h3><div class="value">${App.fmtMoney(total)}</div>
      </div>

      <form onsubmit="revenue.add(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">+ Add Revenue</h3>
        <div class="form-group">
          <label>Week Starting (Monday)</label>
          <input type="date" id="rev-week" value="${defaultWeek}" required>
        </div>
        <div class="form-group">
          <label>Amount ($)</label>
          <input type="number" id="rev-amount" step="0.01" min="0.01" placeholder="0.00" required>
        </div>
        <div class="form-group">
          <label>Notes (optional)</label>
          <input type="text" id="rev-notes" placeholder="Any notes…">
        </div>
        <button type="submit" class="btn btn-success">Save Revenue</button>
      </form>

      ${rows.length ? `<table><thead><tr><th>Week</th><th>Amount</th><th>Notes</th><th></th></tr></thead><tbody>
        ${rows.map(r=>`<tr>
          <td>${App.fmtDate(r.weekStart)}</td>
          <td style="color:#27ae60;font-weight:600">${App.fmtMoney(r.amount)}</td>
          <td style="color:var(--text-muted)">${r.notes||'—'}</td>
          <td><button class="btn btn-danger" style="padding:4px 10px;font-size:12px" onclick="revenue.del(${r.id})">✕</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<p style="color:var(--text-muted);text-align:center;padding:20px 0">No revenue entries yet.</p>'}
    </div>`;
  },

  async add(e) {
    e.preventDefault();
    await DB.add('revenue', {
      weekStart: document.getElementById('rev-week').value,
      amount:    +document.getElementById('rev-amount').value,
      notes:     document.getElementById('rev-notes').value,
      createdAt: new Date().toISOString()
    });
    App.nav('revenue');
  },

  async del(id) {
    if (!confirm('Delete this revenue entry?')) return;
    await DB.delete('revenue', id);
    App.nav('revenue');
  }
};
