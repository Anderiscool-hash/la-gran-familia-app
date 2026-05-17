const expenses = {
  async render() {
    const rows = await DB.getAll('expenses');
    rows.sort((a,b) => new Date(b.date) - new Date(a.date));
    const total = rows.reduce((s,r) => s + (+r.amount), 0);
    const recurring = rows.filter(r => r.isRecurring);
    const monthlyOH = recurring.reduce((s,r) => s + (+r.amount), 0);

    const today = new Date().toISOString().slice(0,10);

    return `
    <div class="card">
      <h2>🧾 Expenses</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <div class="stat-card total-expenses"><h3>Total</h3><div class="value">${App.fmtMoney(total)}</div></div>
        <div class="stat-card" style="background:linear-gradient(135deg,#f7971e,#ffd200)"><h3>Mo. Overhead</h3><div class="value">${App.fmtMoney(monthlyOH)}</div></div>
      </div>

      <form onsubmit="expenses.add(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">+ Add Expense</h3>
        <div class="form-group">
          <label>Type</label>
          <select id="exp-type" onchange="expenses.toggleRecurring()">
            <option value="onetime">One-time expense</option>
            <option value="recurring">Recurring (monthly overhead)</option>
          </select>
        </div>
        <div id="exp-day-group" class="form-group" style="display:none">
          <label>Billing Day (1–31)</label>
          <select id="exp-day">
            ${Array.from({length:31},(_,i)=>`<option value="${i+1}">Day ${i+1}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" id="exp-date" value="${today}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="exp-desc" placeholder="What was this for?" required>
        </div>
        <div class="form-group">
          <label>Amount ($)</label>
          <input type="number" id="exp-amount" step="0.01" min="0.01" placeholder="0.00" required>
        </div>
        <button type="submit" class="btn btn-success">Save Expense</button>
      </form>

      ${rows.length ? `<table><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Type</th><th></th></tr></thead><tbody>
        ${rows.map(r=>`<tr>
          <td>${App.fmtDate(r.date)}</td>
          <td>${r.description}</td>
          <td style="color:#e74c3c;font-weight:600">${App.fmtMoney(r.amount)}</td>
          <td>${r.isRecurring ? `<span class="badge badge-recurring">🔁 Day ${r.recurringDay}</span>` : '<span class="badge" style="background:#eee;color:#555">One-time</span>'}</td>
          <td><button class="btn btn-danger btn-sm" onclick="expenses.del(${r.id})">✕</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<p style="color:var(--text-muted);text-align:center;padding:20px 0">No expenses yet.</p>'}
    </div>`;
  },

  toggleRecurring() {
    const type = document.getElementById('exp-type').value;
    document.getElementById('exp-day-group').style.display = type === 'recurring' ? 'block' : 'none';
  },

  async add(e) {
    e.preventDefault();
    const isRecurring = document.getElementById('exp-type').value === 'recurring';
    await DB.add('expenses', {
      date:         document.getElementById('exp-date').value,
      description:  document.getElementById('exp-desc').value,
      amount:       +document.getElementById('exp-amount').value,
      isRecurring,
      recurringDay: isRecurring ? +document.getElementById('exp-day').value : null,
      createdAt:    new Date().toISOString()
    });
    App.nav('expenses');
  },

  async del(id) {
    if (!confirm('Delete this expense?')) return;
    await DB.delete('expenses', id);
    App.nav('expenses');
  }
};
