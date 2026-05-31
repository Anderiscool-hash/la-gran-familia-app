const dashboard = {
  async render() {
    const { monday, sunday } = App.weekBounds();
    const [revenues, expenses, employees, merch, recurringAll] = await Promise.all([
      DB.getAll('revenue'), DB.getAll('expenses'), DB.getAll('employees'),
      DB.getAll('merchandise'), DB.getAll('expenses')
    ]);

    const weekRevenues = revenues.filter(r => { const d = new Date(r.weekStart); return d >= monday && d <= sunday; });
    const weekExpenses = expenses.filter(e => { const d = new Date(e.date); return d >= monday && d <= sunday; });
    const weekMerch    = merch.filter(p => { const d = new Date(p.date); return d >= monday && d <= sunday; });
    const deductions   = await DB.getAll('deductions');

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

    // Build pie chart segments — only include values > 0
    const segments = [];
    if (totalExpenses > 0) segments.push({ label: t('expenses'),        value: totalExpenses, color: '#e74c3c' });
    if (totalMerch    > 0) segments.push({ label: t('merchandise'),     value: totalMerch,    color: '#1abc9c' });
    if (netPayroll    > 0) segments.push({ label: t('net_payroll'),     value: netPayroll,    color: '#3498db' });
    if (monthlyOH     > 0) segments.push({ label: t('monthly_overhead'),value: monthlyOH,     color: '#e67e22' });
    if (netProfit     > 0) segments.push({ label: t('net_profit'),      value: netProfit,     color: '#27ae60' });

    const chartData = JSON.stringify({ segments, totalRevenue, netProfit });

    return `
    <div class="card">
      <h2>📊 ${t('dashboard')} <small style="font-size:13px;color:var(--text-muted)">${label}</small></h2>
      <div class="grid">
        <div class="stat-card revenue"><h3>${t('revenue')}</h3><div class="value">${App.fmtMoney(totalRevenue)}</div></div>
        <div class="stat-card total-expenses"><h3>${t('expenses')}</h3><div class="value">${App.fmtMoney(totalExpenses)}</div></div>
        <div class="stat-card total-pay"><h3>${t('net_payroll')}</h3><div class="value">${App.fmtMoney(netPayroll)}</div></div>
        <div class="stat-card employee-spending"><h3>${t('merchandise')}</h3><div class="value">${App.fmtMoney(totalMerch)}</div></div>
        <div class="stat-card" style="background:linear-gradient(135deg,#f7971e,#ffd200)"><h3>${t('monthly_overhead')}</h3><div class="value">${App.fmtMoney(monthlyOH)}</div></div>
        <div class="stat-card ${netProfit>=0?'net-profit':'net-loss'}"><h3>${t('net_profit')}</h3><div class="value">${App.fmtMoney(netProfit)}</div></div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
      <div class="card" style="text-align:center">
        <div style="font-size:28px;margin-bottom:6px">💵</div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px">${t('add_revenue')}</p>
        <button class="btn btn-success" style="width:100%" onclick="App.nav('revenue')">+ ${t('revenue')}</button>
      </div>
      <div class="card" style="text-align:center">
        <div style="font-size:28px;margin-bottom:6px">🧾</div>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px">${t('add_expense')}</p>
        <button class="btn btn-success" style="width:100%" onclick="App.nav('expenses')">+ ${t('expenses')}</button>
      </div>
    </div>

    <!-- Pie chart card -->
    <div class="card">
      <h2>🥧 ${t('breakdown')}</h2>
      <script id="pie-data" type="application/json">${chartData}<\/script>
      <canvas id="pieChart" style="display:block;margin:0 auto;width:100%;max-width:300px;height:300px"></canvas>
      <div id="pie-legend" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;justify-content:center"></div>
    </div>

    <div class="card">
      <h2>📈 ${t('expenses')} — ${t('reports')}</h2>
      ${recentExp.length ? `<table><thead><tr><th>${t('date')}</th><th>${t('description')}</th><th>${t('amount')}</th></tr></thead><tbody>
        ${recentExp.map(e=>`<tr><td>${App.fmtDate(e.date)}</td><td>${e.description}</td><td>${App.fmtMoney(e.amount)}</td></tr>`).join('')}
      </tbody></table>` : `<p style="color:var(--text-muted);padding:20px 0;text-align:center">${t('no_expenses')}</p>`}
    </div>`;
  },

  mount() {
    const canvas = document.getElementById('pieChart');
    const dataEl = document.getElementById('pie-data');
    if (!canvas || !dataEl) return;

    const { segments, totalRevenue, netProfit } = JSON.parse(dataEl.textContent);
    const legendEl = document.getElementById('pie-legend');

    // Build legend
    if (segments.length) {
      legendEl.innerHTML = segments.map(s => `
        <div style="display:flex;align-items:center;gap:6px;font-size:13px">
          <span style="width:12px;height:12px;border-radius:3px;background:${s.color};flex-shrink:0"></span>
          <span style="color:var(--text-muted)">${s.label}</span>
          <span style="font-weight:600;color:var(--text)">${App.fmtMoney(s.value)}</span>
        </div>`).join('');
    }

    if (!segments.length) {
      // No data yet — draw empty ring
      const ctx = canvas.getContext('2d');
      const size = 280;
      canvas.width = size; canvas.height = size;
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 20, 0, Math.PI*2);
      ctx.strokeStyle = 'var(--border)';
      ctx.lineWidth = 40;
      ctx.stroke();
      legendEl.innerHTML = `<p style="color:var(--text-muted);font-size:14px">Add revenue &amp; expenses to see breakdown</p>`;
      return;
    }

    const dpr   = window.devicePixelRatio || 1;
    const size  = Math.min(canvas.parentElement.offsetWidth - 40, 300);
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const outerR = size / 2 - 12;
    const innerR = outerR * 0.54;
    const total  = segments.reduce((s, seg) => s + seg.value, 0);
    const rootEl = document.getElementById('htmlRoot');

    const duration  = 1100;
    const startTime = performance.now();

    const animate = (now) => {
      const p      = Math.min((now - startTime) / duration, 1);
      const eased  = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;

      ctx.clearRect(0, 0, size, size);

      // Draw background ring (grey)
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
      ctx.fillStyle = getComputedStyle(rootEl).getPropertyValue('--border').trim() || '#e0e0e0';
      ctx.fill('evenodd');

      // Draw segments
      let startAngle = -Math.PI / 2;
      for (const seg of segments) {
        const sliceAngle = (seg.value / total) * Math.PI * 2 * eased;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.strokeStyle = getComputedStyle(rootEl).getPropertyValue('--surface').trim() || '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        startAngle += sliceAngle;
      }

      // Center text
      const surfaceColor = getComputedStyle(rootEl).getPropertyValue('--surface').trim() || '#fff';
      ctx.beginPath();
      ctx.arc(cx, cy, innerR - 2, 0, Math.PI * 2);
      ctx.fillStyle = surfaceColor;
      ctx.fill();

      const headingColor  = getComputedStyle(rootEl).getPropertyValue('--heading').trim()   || '#2c3e50';
      const mutedColor    = getComputedStyle(rootEl).getPropertyValue('--text-muted').trim() || '#666';

      const profitLabel = netProfit >= 0 ? t('net_profit') : t('net_loss');
      const profitColor = netProfit >= 0 ? '#27ae60' : '#e74c3c';

      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.font         = `bold ${Math.round(size * 0.1)}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillStyle    = headingColor;
      ctx.fillText(App.fmtMoney(Math.abs(netProfit)), cx, cy - size * 0.06);

      ctx.font      = `${Math.round(size * 0.068)}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillStyle = profitColor;
      ctx.fillText(profitLabel, cx, cy + size * 0.06);

      if (p < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
};
