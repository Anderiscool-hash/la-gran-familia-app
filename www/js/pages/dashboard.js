const dashboard = {
  async render() {
    const { monday, sunday } = App.weekBounds();
    const [revenues, expenses, employees, merch, recurringAll] = await Promise.all([
      DB.getAll('revenue'), DB.getAll('expenses'), DB.getAll('employees'),
      DB.getAll('merchandise'), DB.getAll('expenses')
    ]);

    const weekRevenues  = revenues.filter(r => { const d = new Date(r.weekStart); return d >= monday && d <= sunday; });
    const weekExpenses  = expenses.filter(e => { const d = new Date(e.date); return d >= monday && d <= sunday; });
    const weekMerch     = merch.filter(p => { const d = new Date(p.date); return d >= monday && d <= sunday; });
    const deductions    = await DB.getAll('deductions');

    const totalRevenue  = weekRevenues.reduce((s,r) => s + (+r.amount), 0);
    const totalExpenses = weekExpenses.reduce((s,e) => s + (+e.amount), 0);
    const totalMerch    = weekMerch.reduce((s,p) => s + (+p.amount), 0);
    const totalPay      = employees.reduce((s,e) => s + (+e.weeklyPay), 0);
    const totalDed      = deductions.reduce((s,d) => s + (+d.amount), 0);
    const netPayroll    = totalPay - totalDed;
    const netProfit     = totalRevenue - totalExpenses - totalMerch - netPayroll;
    const monthlyOH     = [...new Map(recurringAll.filter(e=>e.isRecurring).map(e=>[e.description+e.amount,e])).values()]
                            .reduce((s,e) => s + (+e.amount), 0);

    const label = `${monday.toLocaleDateString('en-US',{month:'short',day:'numeric'})} — ${sunday.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
    const recentExp = [...expenses].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,5);

    return `
    <div class="card">
      <h2>📊 Weekly Dashboard <small style="font-size:13px;color:var(--text-muted)">${label}</small></h2>
      <div class="grid">
        <div class="stat-card revenue"><h3>Revenue</h3><div class="value">${App.fmtMoney(totalRevenue)}</div></div>
        <div class="stat-card total-expenses"><h3>Expenses</h3><div class="value">${App.fmtMoney(totalExpenses)}</div></div>
        <div class="stat-card total-pay"><h3>Net Payroll</h3><div class="value">${App.fmtMoney(netPayroll)}</div></div>
        <div class="stat-card employee-spending"><h3>Merchandise</h3><div class="value">${App.fmtMoney(totalMerch)}</div></div>
        <div class="stat-card" style="background:linear-gradient(135deg,#f7971e,#ffd200)"><h3>Mo. Overhead</h3><div class="value">${App.fmtMoney(monthlyOH)}</div></div>
        <div class="stat-card ${netProfit>=0?'net-profit':'net-loss'}"><h3>Net Profit</h3><div class="value">${App.fmtMoney(netProfit)}</div></div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
      <div class="card" style="text-align:center">
        <div style="font-size:28px;margin-bottom:6px">💵</div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px">Add this week's revenue</p>
        <button class="btn btn-success" style="width:100%" onclick="App.nav('revenue')">+ Revenue</button>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:28px;margin-bottom:6px">🧾</div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px">Log an expense</p>
        <button class="btn btn-success" style="width:100%" onclick="App.nav('expenses')">+ Expense</button>
      </div>
    </div>

    <div class="card">
      <h2>📈 Recent Expenses</h2>
      ${recentExp.length ? `<table><thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead><tbody>
        ${recentExp.map(e=>`<tr><td>${App.fmtDate(e.date)}</td><td>${e.description}</td><td>${App.fmtMoney(e.amount)}</td></tr>`).join('')}
      </tbody></table>` : '<p style="color:var(--text-muted);padding:20px 0;text-align:center">No expenses yet.</p>'}
    </div>`;
  }
};
