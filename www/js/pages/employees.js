const employees = {
  async render() {
    const [emps, deds] = await Promise.all([DB.getAll('employees'), DB.getAll('deductions')]);
    const totalPay = emps.reduce((s,e) => s + (+e.weeklyPay), 0);
    const totalDed = deds.reduce((s,d) => s + (+d.amount), 0);
    const netPayroll = totalPay - totalDed;

    return `
    <div class="card">
      <h2>👥 ${t('employees')}</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        <div class="stat-card total-pay"><h3>${t('gross_pay')}</h3><div class="value">${App.fmtMoney(totalPay)}</div></div>
        <div class="stat-card total-expenses"><h3>${t('deductions')}</h3><div class="value">${App.fmtMoney(totalDed)}</div></div>
        <div class="stat-card revenue"><h3>${t('net_payroll')}</h3><div class="value">${App.fmtMoney(netPayroll)}</div></div>
      </div>

      <form onsubmit="employees.addEmp(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">${t('add_employee')}</h3>
        <div class="form-group">
          <label>${t('name')}</label>
          <input type="text" id="emp-name" placeholder="${t('full_name')}" required>
        </div>
        <div class="form-group">
          <label>${t('weekly_pay')} ($)</label>
          <input type="number" id="emp-pay" step="0.01" min="0" placeholder="0.00" required>
        </div>
        <button type="submit" class="btn btn-success">${t('add_employee')}</button>
      </form>

      ${emps.length ? `<table><thead><tr><th>${t('name')}</th><th>${t('weekly_pay')}</th><th></th></tr></thead><tbody>
        ${emps.map(e=>`<tr>
          <td style="font-weight:600">${e.name}</td>
          <td style="color:#27ae60;font-weight:600">${App.fmtMoney(e.weeklyPay)}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="employees.showDeds(${e.id},'${e.name}')">${t('deductions')}</button>
            <button class="btn btn-danger btn-sm" onclick="employees.delEmp(${e.id})" style="margin-left:6px">✕</button>
          </td>
        </tr>`).join('')}
      </tbody></table>` : `<p style="color:var(--text-muted);text-align:center;padding:20px 0">${t('no_employees')}</p>`}
    </div>

    <div class="card" id="deductions-card" style="display:none">
      <h2>📋 ${t('deductions')}</h2>
      <div id="deductions-content"></div>
    </div>`;
  },

  async addEmp(e) {
    e.preventDefault();
    await DB.add('employees', {
      name:      document.getElementById('emp-name').value,
      weeklyPay: +document.getElementById('emp-pay').value,
      createdAt: new Date().toISOString()
    });
    App.nav('employees');
  },

  async delEmp(id) {
    if (!confirm(t('del_employee'))) return;
    await DB.delete('employees', id);
    const deds = await DB.getAll('deductions');
    for (const d of deds.filter(d => d.employeeId === id)) {
      await DB.delete('deductions', d.id);
    }
    App.nav('employees');
  },

  async showDeds(empId, empName) {
    const card = document.getElementById('deductions-card');
    card.style.display = 'block';
    const all = await DB.getAll('deductions');
    const deds = all.filter(d => d.employeeId === empId);
    const total = deds.reduce((s,d) => s + (+d.amount), 0);

    document.getElementById('deductions-content').innerHTML = `
      <p style="margin-bottom:12px;color:var(--text-muted)">${empName} — ${t('deductions')}: <strong style="color:#e74c3c">${App.fmtMoney(total)}</strong></p>
      <form onsubmit="employees.addDed(event,${empId})" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        <input type="text" id="ded-desc" placeholder="${t('description')}" style="flex:1;min-width:140px" required>
        <input type="number" id="ded-amount" step="0.01" min="0.01" placeholder="${t('amount')}" style="width:110px" required>
        <button type="submit" class="btn btn-success">${t('add')}</button>
      </form>
      ${deds.length ? `<table><thead><tr><th>${t('description')}</th><th>${t('amount')}</th><th></th></tr></thead><tbody>
        ${deds.map(d=>`<tr>
          <td>${d.description}</td>
          <td style="color:#e74c3c">${App.fmtMoney(d.amount)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="employees.delDed(${d.id},${empId},'${empName}')">✕</button></td>
        </tr>`).join('')}
      </tbody></table>` : `<p style="color:var(--text-muted)">${t('no_deductions')}</p>`}
    `;
    card.scrollIntoView({ behavior: 'smooth' });
  },

  async addDed(e, empId) {
    e.preventDefault();
    const emp = await DB.get('employees', empId);
    await DB.add('deductions', {
      employeeId:   empId,
      employeeName: emp?.name || '',
      description:  document.getElementById('ded-desc').value,
      amount:       +document.getElementById('ded-amount').value,
      createdAt:    new Date().toISOString()
    });
    App.nav('employees');
  },

  async delDed(id) {
    if (!confirm(t('del_deduction'))) return;
    await DB.delete('deductions', id);
    App.nav('employees');
  }
};
