const reports = {
  async render() {
    const [revenues, expenses, employees, merch, deductions] = await Promise.all([
      DB.getAll('revenue'), DB.getAll('expenses'), DB.getAll('employees'),
      DB.getAll('merchandise'), DB.getAll('deductions')
    ]);

    const { monday, sunday } = App.weekBounds();
    const weekRevs  = revenues.filter(r => { const d = new Date(r.weekStart); return d >= monday && d <= sunday; });
    const weekExps  = expenses.filter(e => { const d = new Date(e.date); return d >= monday && d <= sunday; });
    const weekMerch = merch.filter(p => { const d = new Date(p.date); return d >= monday && d <= sunday; });

    const totalRevAll   = revenues.reduce((s,r) => s + (+r.amount), 0);
    const totalExpAll   = expenses.reduce((s,e) => s + (+e.amount), 0);
    const totalMerchAll = merch.reduce((s,p) => s + (+p.amount), 0);

    const wRev  = weekRevs.reduce((s,r) => s + (+r.amount), 0);
    const wExp  = weekExps.reduce((s,e) => s + (+e.amount), 0);
    const wMerch= weekMerch.reduce((s,p) => s + (+p.amount), 0);
    const totalPay   = employees.reduce((s,e) => s + (+e.weeklyPay), 0);
    const totalDed   = deductions.reduce((s,d) => s + (+d.amount), 0);
    const netPayroll = totalPay - totalDed;
    const wProfit    = wRev - wExp - wMerch - netPayroll;

    const label = `${monday.toLocaleDateString('en-US',{month:'short',day:'numeric'})} — ${sunday.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;

    return `
    <div class="card">
      <h2>📊 ${t('weekly_report')} <small style="font-size:13px;color:var(--text-muted)">${label}</small></h2>
      <div class="grid">
        <div class="stat-card revenue"><h3>${t('revenue')}</h3><div class="value">${App.fmtMoney(wRev)}</div></div>
        <div class="stat-card total-expenses"><h3>${t('expenses')}</h3><div class="value">${App.fmtMoney(wExp)}</div></div>
        <div class="stat-card employee-spending"><h3>${t('merchandise')}</h3><div class="value">${App.fmtMoney(wMerch)}</div></div>
        <div class="stat-card total-pay"><h3>${t('net_payroll')}</h3><div class="value">${App.fmtMoney(netPayroll)}</div></div>
        <div class="stat-card ${wProfit>=0?'net-profit':'net-loss'}"><h3>${t('net_profit')}</h3><div class="value">${App.fmtMoney(wProfit)}</div></div>
      </div>
    </div>

    <div class="card">
      <h2>📈 ${t('all_time_totals')}</h2>
      <div class="grid">
        <div class="stat-card revenue"><h3>${t('all_revenue')}</h3><div class="value">${App.fmtMoney(totalRevAll)}</div></div>
        <div class="stat-card total-expenses"><h3>${t('all_expenses')}</h3><div class="value">${App.fmtMoney(totalExpAll)}</div></div>
        <div class="stat-card employee-spending"><h3>${t('all_merch')}</h3><div class="value">${App.fmtMoney(totalMerchAll)}</div></div>
      </div>
    </div>

    <div class="card">
      <h2>🧾 ${t('all_expenses')}</h2>
      ${expenses.length ? `<table><thead><tr><th>${t('date')}</th><th>${t('description')}</th><th>${t('amount')}</th><th>${t('type')}</th></tr></thead><tbody>
        ${[...expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(e=>`<tr>
          <td>${App.fmtDate(e.date)}</td>
          <td>${e.description}</td>
          <td style="color:#e74c3c">${App.fmtMoney(e.amount)}</td>
          <td>${e.isRecurring ? `<span class="badge badge-recurring">🔁</span>` : ''}</td>
        </tr>`).join('')}
      </tbody></table>` : `<p style="color:var(--text-muted);padding:20px 0;text-align:center">${t('no_expenses')}</p>`}
    </div>

    <div class="card">
      <h2>💵 ${t('all_revenue')}</h2>
      ${revenues.length ? `<table><thead><tr><th>${t('date')}</th><th>${t('amount')}</th><th>${t('notes')}</th></tr></thead><tbody>
        ${[...revenues].sort((a,b)=>new Date(b.weekStart)-new Date(a.weekStart)).map(r=>`<tr>
          <td>${App.fmtDate(r.weekStart)}</td>
          <td style="color:#27ae60">${App.fmtMoney(r.amount)}</td>
          <td style="color:var(--text-muted)">${r.notes||'—'}</td>
        </tr>`).join('')}
      </tbody></table>` : `<p style="color:var(--text-muted);padding:20px 0;text-align:center">${t('no_revenue')}</p>`}
    </div>`;
  }
};
