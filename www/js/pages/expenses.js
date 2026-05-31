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
      <h2>🧾 ${t('expenses')}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <div class="stat-card total-expenses"><h3>${t('total_expenses')}</h3><div class="value">${App.fmtMoney(total)}</div></div>
        <div class="stat-card" style="background:linear-gradient(135deg,#f7971e,#ffd200)"><h3>${t('monthly_overhead')}</h3><div class="value">${App.fmtMoney(monthlyOH)}</div></div>
      </div>

      <form onsubmit="expenses.add(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">${t('add_expense')}</h3>
        <div class="form-group">
          <label>${t('type')}</label>
          <select id="exp-type" onchange="expenses.toggleRecurring()">
            <option value="onetime">${t('one_time')}</option>
            <option value="recurring">${t('recurring')}</option>
          </select>
        </div>
        <div id="exp-day-group" class="form-group" style="display:none">
          <label>${t('billing_day')}</label>
          <select id="exp-day">
            ${Array.from({length:31},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>${t('date')}</label>
          <input type="date" id="exp-date" value="${today}" required>
        </div>
        <div class="form-group">
          <label>${t('description')}</label>
          <input type="text" id="exp-desc" placeholder="…" required>
        </div>
        <div class="form-group">
          <label>${t('amount')} ($)</label>
          <input type="number" id="exp-amount" step="0.01" min="0.01" placeholder="0.00" required>
        </div>
        <button type="submit" class="btn btn-success">${t('save_expense')}</button>
      </form>

      ${rows.length ? `<table><thead><tr><th>${t('date')}</th><th>${t('description')}</th><th>${t('amount')}</th><th>${t('type')}</th><th></th></tr></thead><tbody>
        ${rows.map(r=>`<tr>
          <td>${App.fmtDate(r.date)}</td>
          <td>${r.description}</td>
          <td style="color:#e74c3c;font-weight:600">${App.fmtMoney(r.amount)}</td>
          <td>${r.isRecurring ? `<span class="badge badge-recurring">🔁 ${r.recurringDay}</span>` : `<span class="badge" style="background:#eee;color:#555">${t('one_time')}</span>`}</td>
          <td><button class="btn btn-danger btn-sm" onclick="expenses.del(${r.id})">✕</button></td>
        </tr>`).join('')}
      </tbody></table>` : `<p style="color:var(--text-muted);text-align:center;padding:20px 0">${t('no_expenses')}</p>`}
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
    if (!confirm(t('delete') + '?')) return;
    await DB.delete('expenses', id);
    App.nav('expenses');
  }
};
