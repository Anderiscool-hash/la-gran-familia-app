const reports = {
  async render() {
    const c = await getWeekStats();
    const allRev = c.revenue.reduce((s, r) => s + (+r.amount), 0);
    const allExp = c.expenses.reduce((s, e) => s + (+e.amount), 0);
    const allMerch = c.merchandise.reduce((s, m) => s + (+m.amount), 0);
    const profitClass = c.netProfit >= 0 ? 'c-pos' : 'c-neg';

    const breakdown = [['revenue', c.moneyIn, 'pos'], ['total_expenses', c.weekExpenses, 'neg'], ['merchandise', c.weekMerch, 'info'], ['net_payroll', c.netPayroll, 'brand']]
      .map(m => `<div style="display:flex;align-items:center;gap:9px">
        <span class="legend-dot" style="background:var(--${m[2]})"></span>
        <span style="font-size:12.5px;color:var(--muted);flex:1">${t(m[0])}</span>
        <span class="money c-text" style="font-size:13.5px">${App.fmtMoney(m[1])}</span></div>`).join('');

    const totals = [['all_revenue', allRev, 'pos', 'revenue'], ['all_expenses', allExp, 'neg', 'expenses'], ['all_merch', allMerch, 'info', 'merchandise']]
      .map((m, i) => `<div class="row">
        ${App.iconChip(m[3], m[2])}
        <div class="r-main"><div class="r-title">${t(m[0])}</div></div>
        <span class="money c-${m[2]}" style="font-size:16px">${App.fmtMoney(m[1])}</span></div>`).join('');

    return `<div class="page">
      <div class="rise">${App.sectionHead('export_csv')}
        <div class="card" style="display:flex;flex-wrap:wrap;gap:9px">
          ${CSV.buttons(['revenue', 'expenses', 'merchandise', 'employees', 'deductions', 'orders', 'users'])}
        </div>
      </div>

      <div class="card rise" style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div><div class="metric-label">${t('net_profit')} · ${t('this_week')}</div>
            <span class="money ${profitClass}" style="font-size:32px;display:block;margin-top:6px">${App.fmtMoney(Math.abs(c.netProfit))}</span></div>
          <div style="text-align:right;padding-top:2px">${App.delta(c.margin)}
            <div style="font-size:11px;color:var(--faint);margin-top:5px">${t('profit_margin')}</div></div>
        </div>
        <div class="hairline"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px 12px">${breakdown}</div>
      </div>

      <div class="rise">${App.sectionHead('all_time_totals')}<div class="card flush">${totals}</div></div>

      <div class="rise">${App.sectionHead('all_expenses')}
        <div class="card flush">
          ${c.expenses.length ? [...c.expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => `<div class="row">
            ${App.iconChip(e.isRecurring ? 'repeat' : 'expenses', e.isRecurring ? 'warn' : 'neg', { sm: true, icon: 16 })}
            <div class="r-main"><div class="r-title">${App.esc(e.description)}</div>
              <div class="r-sub">${e.isRecurring ? `${t('recurring')} · ${t('day')} ${e.recurringDay}` : App.fmtDateShort(e.date)}</div></div>
            <span class="money c-neg" style="font-size:14.5px">${App.fmtMoney(e.amount)}</span></div>`).join('') : App.emptyState('expenses', 'no_expenses')}
        </div></div>

      <div class="rise">${App.sectionHead('all_revenue')}
        <div class="card flush">
          ${c.rev.length ? c.rev.map(r => `<div class="row">
            ${App.iconChip('calendar', 'neutral', { sm: true, icon: 16 })}
            <div class="r-main"><div class="r-title">${App.fmtDateShort(r.weekStart)}</div>
              <div class="r-sub">${r.notes ? App.esc(r.notes) : `${t('cash')} / ${t('card')}`}</div></div>
            <span class="money c-pos" style="font-size:14.5px">${App.fmtMoney(r.amount)}</span></div>`).join('') : App.emptyState('revenue', 'no_revenue')}
        </div></div>
    </div>`;
  },
};
