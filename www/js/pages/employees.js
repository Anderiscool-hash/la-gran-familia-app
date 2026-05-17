const employees = {
  async render() {
    const [emps, deds] = await Promise.all([DB.getAll('employees'), DB.getAll('deductions')]);
    const totalPay = emps.reduce((s,e) => s + (+e.weeklyPay), 0);
    const totalDed = deds.reduce((s,d) => s + (+d.amount), 0);
    const netPayroll = totalPay - totalDed;

    return `
    <div class="card">
      <h2>👥 Employees</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
        <div class="stat-card total-pay"><h3>Gross Pay</h3><div class="value">${App.fmtMoney(totalPay)}</div></div>
        <div class="stat-card total-expenses"><h3>Deductions</h3><div class="value">${App.fmtMoney(totalDed)}</div></div>
        <div class="stat-card revenue"><h3>Net Payroll</h3><div class="value">${App.fmtMoney(netPayroll)}</div></div>
      </div>

      <form onsubmit="employees.addEmp(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">+ Add Employee</h3>
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="emp-name" placeholder="Full name" required>
        </div>
        <div class="form-group">
          <label>Weekly Pay ($)</label>
          <input type="number" id="emp-pay" step="0.01" min="0" placeholder="0.00" required>
        </div>
        <button type="submit" class="btn btn-success">Add Employee</button>
      </form>

      ${emps.length ? `<table><thead><tr><th>Name</th><th>Weekly Pay</th><th></th></tr></thead><tbody>
        ${emps.map(e=>`<tr>
          <td style="font-weight:600">${e.name}</td>
          <td style="color:#27ae60;font-weight:600">${App.fmtMoney(e.weeklyPay)}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="employees.showDeds(${e.id},'${e.name}')">Deductions</button>
            <button class="btn btn-danger btn-sm" onclick="employees.delEmp(${e.id})" style="margin-left:6px">✕</button>
          </td>
        </tr>`).join('')}
      </tbody></table>` : '<p style="color:var(--text-muted);text-align:center;padding:20px 0">No employees yet.</p>'}
    </div>

    <div class="card" id="deductions-card" style="display:none">
      <h2>📋 Deductions</h2>
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
    if (!confirm('Delete this employee and their deductions?')) return;
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
      <p style="margin-bottom:12px;color:var(--text-muted)">Employee: <strong style="color:var(--text)">${empName}</strong> — Total deductions: <strong style="color:#e74c3c">${App.fmtMoney(total)}</strong></p>
      <form onsubmit="employees.addDed(event,${empId})" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        <input type="text" id="ded-desc" placeholder="Description (e.g. advance)" style="flex:1;min-width:140px" required>
        <input type="number" id="ded-amount" step="0.01" min="0.01" placeholder="Amount" style="width:110px" required>
        <button type="submit" class="btn btn-success">Add</button>
      </form>
      ${deds.length ? `<table><thead><tr><th>Description</th><th>Amount</th><th></th></tr></thead><tbody>
        ${deds.map(d=>`<tr>
          <td>${d.description}</td>
          <td style="color:#e74c3c">${App.fmtMoney(d.amount)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="employees.delDed(${d.id},${empId},'${empName}')">✕</button></td>
        </tr>`).join('')}
      </tbody></table>` : '<p style="color:var(--text-muted)">No deductions yet.</p>'}
    `;
    card.scrollIntoView({ behavior: 'smooth' });
  },

  async addDed(e, empId) {
    e.preventDefault();
    const emp = await DB.get('employees', empId);
    await DB.add('deductions', {
      employeeId:  empId,
      employeeName: emp?.name || '',
      description: document.getElementById('ded-desc').value,
      amount:      +document.getElementById('ded-amount').value,
      createdAt:   new Date().toISOString()
    });
    App.nav('employees');
  },

  async delDed(id, empId, empName) {
    if (!confirm('Remove this deduction?')) return;
    await DB.delete('deductions', id);
    App.nav('employees');
  }
};
