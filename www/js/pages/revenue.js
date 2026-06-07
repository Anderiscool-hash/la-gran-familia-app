const revenue = {
  async render() {
    const rows = (await DB.getAll('revenue')).sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
    const weekRows = rows.filter(r => App.inThisWeek(r.weekStart));
    const total  = weekRows.reduce((s, r) => s + (+r.amount), 0);
    const cash   = weekRows.reduce((s, r) => s + (+r.cash || 0), 0);
    const credit = weekRows.reduce((s, r) => s + (+r.credit || 0), 0);
    const allTotal = rows.reduce((s, r) => s + (+r.amount), 0);
    const splitTotal = cash + credit || 1;

    return `<div class="page">
      <div class="card rise" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div class="metric-label">${t('revenue')} · ${App.selectedWeekLabel()}</div>
            <span class="money c-text" style="font-size:32px;display:block;margin-top:6px">${App.fmtMoney(total)}</span>
          </div>
          <div class="iconchip t-pos" style="width:42px;height:42px">${icon('revenue', { size: 22 })}</div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11.5px;font-weight:600;color:var(--muted);margin-bottom:6px">
            <span>${t('cash_split')}</span>
            <span class="num">${Math.round(cash / splitTotal * 100)}% / ${Math.round(credit / splitTotal * 100)}%</span>
          </div>
          <div class="flow-bar"><span style="flex:${cash};background:var(--pos)"></span><span style="flex:${credit};background:var(--info)"></span></div>
        </div>
        <div style="display:flex;gap:10px">
          ${substat('cash', 'cash', cash, 'c-pos')}
          ${substat('card', 'card', credit, 'c-info')}
        </div>
        <div style="font-size:12.5px;color:var(--faint)">${t('total_all_time')}: <span class="money c-text">${App.fmtMoney(allTotal)}</span></div>
      </div>

      <button class="btn btn-brand btn-full" onclick="App.openForm('revenue')">${icon('plus', { size: 18 })}${t('add_revenue')}</button>

      <div class="rise">
        ${App.sectionHead('selected_week_revenue')}
        <div class="card flush">
          ${weekRows.length ? weekRows.map(r => `<div class="row">
            ${App.iconChip('calendar', 'neutral')}
            <div class="r-main">
              <div class="r-title">${App.fmtDateShort(r.weekStart)}</div>
              <div class="r-sub">${t('cash')} ${App.fmtMoney0(r.cash || 0)} · ${t('card')} ${App.fmtMoney0(r.credit || 0)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="money" style="font-size:15px">${App.fmtMoney(r.amount)}</span>
              <button class="icon-btn" onclick="revenue.del(${r.id})">${icon('trash', { size: 16 })}</button>
            </div>
          </div>`).join('') : App.emptyState('revenue', 'no_revenue')}
        </div>
      </div>
    </div>`;
  },

  // Open the form with the date pre-set to the day AFTER the most recent entry,
  // so revenue isn't entered for the same day twice. See App.openForm('revenue').
  async openAddForm() {
    const rows = await DB.getAll('revenue');
    const last = rows.map(r => r.weekStart).filter(Boolean).sort().pop();
    let def;
    if (last) {
      const d = new Date(last + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      def = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else {
      const n = new Date();
      def = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    }
    App.openSheet({ title: t('add_revenue'), body: this.formHTML(def), onMount: () => this.formMount() });
  },
  formHTML(defaultDate) {
    return `<div style="padding-bottom:8px">
      <div class="field"><label class="lbl">${t('date')}</label>
        <input class="in" type="date" id="rev-week" value="${defaultDate || App.mondayISO()}"></div>
      <div class="grid-2">
        <div class="field"><label class="lbl">${t('cash')}</label>${App.moneyField('rev-cash')}</div>
        <div class="field"><label class="lbl">${t('card')}</label>${App.moneyField('rev-credit')}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;background:var(--sunken);border-radius:13px;padding:13px 15px;margin-bottom:16px">
        <span style="font-weight:600;color:var(--muted)">${t('total')}</span>
        <span class="money c-pos" id="rev-total" style="font-size:22px">$0.00</span>
      </div>
      <div class="field"><label class="lbl">${t('notes')}</label><input class="in" id="rev-notes" placeholder="…"></div>
      <button class="btn btn-brand btn-full" onclick="revenue.add()">${icon('check', { size: 18 })}${t('save_revenue')}</button>
    </div>`;
  },
  formMount() {
    const upd = () => { document.getElementById('rev-total').textContent = App.fmtMoney(App.readMoney('rev-cash') + App.readMoney('rev-credit')); };
    ['rev-cash', 'rev-credit'].forEach(id => document.getElementById(id).addEventListener('input', upd));
  },
  async add() {
    const cash = App.readMoney('rev-cash'), credit = App.readMoney('rev-credit');
    if (cash === 0 && credit === 0) return;
    await DB.add('revenue', { weekStart: document.getElementById('rev-week').value, cash, credit, amount: cash + credit, notes: document.getElementById('rev-notes').value, createdAt: new Date().toISOString() });
    App.closeSheet(); App.refresh(); App.toast(t('save_revenue'));
  },
  async del(id) { await DB.delete('revenue', id); App.refresh(); },
};

function substat(labelKey, ic, value, colorCls) {
  return `<div style="flex:1;background:var(--surface-2);border:1px solid var(--hairline);border-radius:13px;padding:11px 13px">
    <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">${icon(ic, { size: 15, cls: colorCls })}
      <span style="font-size:12px;font-weight:600;color:var(--muted)">${t(labelKey)}</span></div>
    <span class="money c-text" style="font-size:16.5px">${App.fmtMoney(value)}</span></div>`;
}
