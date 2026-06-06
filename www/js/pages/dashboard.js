/* Shared weekly computation — used by dashboard & reports */
async function getWeekStats() {
  const [revenue, expenses, merchandise, employees, deductions] = await Promise.all([
    DB.getAll('revenue'), DB.getAll('expenses'), DB.getAll('merchandise'),
    DB.getAll('employees'), DB.getAll('deductions'),
  ]);
  const rev = [...revenue].sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
  // Revenue is entered per-day, so sum every entry that falls in the week
  // (Mon–Sun) rather than matching a single Monday-dated row.
  const { monday, sunday } = App.weekBounds();
  const prevMonday = new Date(monday); prevMonday.setDate(monday.getDate() - 7);
  const prevSunday = new Date(monday); prevSunday.setDate(monday.getDate() - 1); prevSunday.setHours(23, 59, 59, 999);
  const inRange = (iso, from, to) => { const d = new Date((iso || '').length === 10 ? iso + 'T00:00:00' : iso); return d >= from && d <= to; };
  const sumRev = list => list.reduce((s, r) => s + (+r.amount || 0), 0);
  const thisWeekRev = revenue.filter(r => inRange(r.weekStart, monday, sunday));
  const prevWeekRev = revenue.filter(r => inRange(r.weekStart, prevMonday, prevSunday));
  const weekRev = {
    amount: sumRev(thisWeekRev),
    cash: thisWeekRev.reduce((s, r) => s + (+r.cash || 0), 0),
    credit: thisWeekRev.reduce((s, r) => s + (+r.credit || 0), 0),
  };
  const prevRev = { amount: sumRev(prevWeekRev) };
  const weekExpenses = expenses.filter(e => !e.isRecurring && App.inThisWeek(e.date)).reduce((s, e) => s + (+e.amount), 0);
  const weekMerch = merchandise.filter(m => App.inThisWeek(m.date)).reduce((s, m) => s + (+m.amount), 0);
  const grossPay = employees.reduce((s, e) => s + (+e.weeklyPay || 0), 0);
  const totalDed = deductions.reduce((s, d) => s + (+d.amount || 0), 0);
  const netPayroll = grossPay - totalDed;
  const monthlyOH = expenses.filter(e => e.isRecurring).reduce((s, e) => s + (+e.amount), 0);
  const moneyIn = +weekRev.amount || 0;
  const costs = weekExpenses + weekMerch + netPayroll;
  const netProfit = moneyIn - costs;
  const revDelta = prevRev.amount ? ((weekRev.amount - prevRev.amount) / prevRev.amount) * 100 : null;
  const margin = moneyIn ? (netProfit / moneyIn) * 100 : 0;
  return { revenue, expenses, merchandise, employees, deductions, rev, weekRev, prevRev, thisWeekRev,
    weekExpenses, weekMerch, grossPay, totalDed, netPayroll, monthlyOH, moneyIn, costs, netProfit, revDelta, margin };
}

const dashboard = {
  async render() {
    const c = await getWeekStats();
    const profitClass = c.netProfit >= 0 ? 'c-pos' : 'c-neg';

    const segs = [
      ['net_profit', Math.max(0, c.netProfit), 'var(--pos)'],
      ['net_payroll', c.netPayroll, 'var(--brand)'],
      ['merchandise', c.weekMerch, 'var(--info)'],
      ['total_expenses', c.weekExpenses, 'var(--neg)'],
    ].filter(s => s[1] > 0);

    const flow = `<div class="flow-bar">
      <span style="flex:${Math.max(0, c.netProfit)};background:var(--pos)"></span>
      <span style="flex:${c.netPayroll};background:var(--brand)"></span>
      <span style="flex:${c.weekMerch};background:var(--info)"></span>
      <span style="flex:${c.weekExpenses};background:var(--neg)"></span>
    </div>`;

    // trend — last 5 weeks
    const trend = [...c.rev].sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart)).slice(-5);
    const maxT = Math.max(...trend.map(r => +r.amount), 1);
    const bars = trend.map((r, i) => {
      const last = i === trend.length - 1;
      const h = Math.max(6, (+r.amount / maxT) * 74);
      const lbl = new Date(r.weekStart + 'T00:00:00').toLocaleDateString(App.lang() === 'es' ? 'es-MX' : 'en-US', { day: 'numeric' });
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">
        <div class="num" style="font-size:10.5px;font-weight:600;color:${last ? 'var(--brand)' : 'var(--faint)'}">${App.fmtK(r.amount)}</div>
        <div style="width:100%;max-width:30px;height:${h}px;border-radius:7px;background:${last ? 'var(--brand)' : 'var(--border)'}"></div>
        <div style="font-size:10.5px;color:var(--faint);font-weight:500">${lbl}</div>
      </div>`;
    }).join('');

    // recent activity
    const recent = [
      ...c.expenses.filter(e => !e.isRecurring).map(e => ({ icon: 'expenses', tone: 'neg', title: e.description, date: e.date, amount: -e.amount })),
      ...c.merchandise.map(m => ({ icon: 'merchandise', tone: 'info', title: m.vendorName, date: m.date, amount: -m.amount })),
      ...c.thisWeekRev.map(r => ({ icon: 'revenue', tone: 'pos', title: t('revenue'), date: r.weekStart, amount: +r.amount })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const metricCells = [
      ['revenue', c.moneyIn, 'revenue', 'pos'],
      ['total_expenses', c.weekExpenses, 'expenses', 'neg'],
      ['merchandise', c.weekMerch, 'merchandise', 'info'],
      ['net_payroll', c.netPayroll, 'employees', 'brand'],
    ].map((m, i) => `
      <div style="padding:15px;${i % 2 === 0 ? 'border-right:1px solid var(--hairline);' : ''}${i < 2 ? 'border-bottom:1px solid var(--hairline);' : ''}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:9px">
          ${App.iconChip(m[2], m[3], { sm: true })}
          <span class="metric-label">${t(m[0])}</span>
        </div>
        <span class="money" style="font-size:20px">${App.fmtMoney(m[1])}</span>
      </div>`).join('');

    return `<div class="page">

      <div class="card rise" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="metric-label">${c.netProfit >= 0 ? t('net_profit') : t('net_loss')} · ${t('this_week')}</div>
            <div style="display:flex;align-items:baseline;gap:10px;margin-top:6px">
              <span class="money ${profitClass}" style="font-size:38px">${App.fmtMoney(Math.abs(c.netProfit))}</span>
              ${App.delta(c.revDelta)}
            </div>
            <div style="font-size:12.5px;color:var(--faint);margin-top:3px">${Math.round(c.margin)}% ${t('profit_margin').toLowerCase()} · ${t('vs_last')}</div>
          </div>
          <div class="iconchip t-pos" style="width:42px;height:42px">${icon('wallet', { size: 22 })}</div>
        </div>
        ${flow}
        <div style="display:flex;justify-content:space-between;gap:12px">
          <div><div class="metric-label">${t('money_in')}</div><span class="money c-text" style="font-size:16px">${App.fmtMoney(c.moneyIn)}</span></div>
          <div style="text-align:right"><div class="metric-label">${t('money_out')}</div><span class="money c-text" style="font-size:16px">${App.fmtMoney(c.costs)}</span></div>
        </div>
      </div>

      <div class="card rise" style="padding:0">
        <div class="grid-2">${metricCells}</div>
      </div>

      <div class="rise">
        ${App.sectionHead('where_money_goes')}
        <div class="card" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:18px">
          ${donutSVG(segs, c.netProfit, t('net_profit'), c.netProfit >= 0 ? 'var(--pos)' : 'var(--neg)')}
          <div style="width:100%;display:grid;grid-template-columns:1fr 1fr;gap:9px 16px">
            ${segs.map(s => `<div style="display:flex;align-items:center;gap:8px">
              <span class="legend-dot" style="background:${s[2]}"></span>
              <span style="font-size:12.5px;color:var(--muted);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t(s[0])}</span>
              <span class="money c-text" style="font-size:12.5px">${App.fmtMoney0(s[1])}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>

      ${trend.length ? `<div class="rise">
        ${App.sectionHead('revenue')}
        <div class="card" style="padding:18px">
          <div style="display:flex;align-items:flex-end;gap:10px;height:96px">${bars}</div>
        </div>
      </div>` : ''}

      <div class="rise">
        ${App.sectionHead('recent_activity')}
        <div class="card flush">
          ${recent.length ? recent.map(r => `<div class="row">
            ${App.iconChip(r.icon, r.tone)}
            <div class="r-main"><div class="r-title">${App.esc(r.title)}</div><div class="r-sub">${App.fmtDateShort(r.date)}</div></div>
            <span class="money ${r.amount >= 0 ? 'c-pos' : 'c-text'}" style="font-size:14.5px">${App.fmtMoney(Math.abs(r.amount))}</span>
          </div>`).join('') : App.emptyState('sparkle', 'no_revenue')}
        </div>
      </div>

    </div>`;
  },
};

/* Donut chart as inline SVG */
function donutSVG(segments, centerVal, centerLabel, centerColor) {
  const size = 188, stroke = 22, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x[1], 0) || 1;
  let off = 0;
  const arcs = segments.map(seg => {
    const dash = (seg[1] / total) * circ;
    const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${seg[2]}" stroke-width="${stroke}"
      stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})"></circle>`;
    off += dash;
    return el;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--sunken)" stroke-width="${stroke}"></circle>
    ${arcs}
    <text x="50%" y="46%" text-anchor="middle" dominant-baseline="middle" style="font-family:var(--font-num);font-size:27px;font-weight:680;letter-spacing:-0.03em;fill:${centerColor}">${App.fmtMoney0(Math.abs(centerVal))}</text>
    <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" style="font-family:var(--font-ui);font-size:12.5px;font-weight:600;fill:var(--muted)">${centerLabel}</text>
  </svg>`;
}
