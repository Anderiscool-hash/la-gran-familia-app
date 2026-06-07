const expenses = {
  _filter: 'all',
  _formType: 'one',

  async render() {
    const all = (await DB.getAll('expenses')).sort((a, b) => new Date(b.date) - new Date(a.date));
    const weekOneTime = all.filter(e => !e.isRecurring && App.inThisWeek(e.date));
    const recurring = all.filter(e => e.isRecurring);
    let rows = [...weekOneTime, ...recurring].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (this._filter === 'one') rows = weekOneTime;
    if (this._filter === 'rec') rows = recurring;
    const total = weekOneTime.reduce((s, e) => s + (+e.amount), 0);
    const oh = all.filter(e => e.isRecurring).reduce((s, e) => s + (+e.amount), 0);
    const seg = (k, lbl) => `<button class="${this._filter === k ? 'active' : ''}" onclick="expenses.setFilter('${k}')">${lbl}</button>`;

    return `<div class="page">
      <div class="grid-2 rise">
        <div class="card">
          <div style="margin-bottom:9px">${App.iconChip('expenses', 'neg', { sm: true, icon: 17 })}</div>
          <div class="metric-label">${t('total_expenses')} · ${App.selectedWeekLabel()}</div>
          <span class="money c-text" style="font-size:22px">${App.fmtMoney(total)}</span>
        </div>
        <div class="card">
          <div style="margin-bottom:9px">${App.iconChip('repeat', 'warn', { sm: true, icon: 17 })}</div>
          <div class="metric-label">${t('monthly_overhead')}</div>
          <span class="money c-text" style="font-size:22px">${App.fmtMoney(oh)}</span>
        </div>
      </div>

      <button class="btn btn-brand btn-full" onclick="App.openForm('expense')">${icon('plus', { size: 18 })}${t('add_expense')}</button>

      <div class="segmented">${seg('all', t('all'))}${seg('one', t('one_time'))}${seg('rec', t('recurring'))}</div>

      <div class="card flush rise">
        ${rows.length ? rows.map(e => `<div class="row">
          ${App.iconChip(e.isRecurring ? 'repeat' : 'expenses', e.isRecurring ? 'warn' : 'neg')}
          <div class="r-main">
            <div class="r-title">${App.esc(e.description)}</div>
            <div class="r-sub">${e.isRecurring ? `${t('recurring')} · ${t('day')} ${e.recurringDay}` : App.fmtDateShort(e.date)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="money c-neg" style="font-size:15px">${App.fmtMoney(e.amount)}</span>
            <button class="icon-btn" onclick="expenses.del(${e.id})">${icon('trash', { size: 16 })}</button>
          </div>
        </div>`).join('') : App.emptyState('expenses', 'no_expenses')}
      </div>
    </div>`;
  },

  setFilter(f) { this._filter = f; App.refresh(); },

  formHTML() {
    this._formType = 'one';
    return `<div style="padding-bottom:8px">
      <div class="field"><label class="lbl">${t('type')}</label>
        <div class="segmented" id="exp-type-seg">
          <button class="active" data-v="one" onclick="expenses.pickType('one')">${t('one_time')}</button>
          <button data-v="rec" onclick="expenses.pickType('rec')">${t('recurring')}</button>
        </div></div>
      <div id="exp-when">
        <div class="field"><label class="lbl">${t('date')}</label><input class="in" type="date" id="exp-date" value="${App.mondayISO()}"></div>
      </div>
      <div class="field"><label class="lbl">${t('description')}</label><input class="in" id="exp-desc" placeholder="…"></div>
      <div class="field"><label class="lbl">${t('amount')}</label>${App.moneyField('exp-amount')}</div>
      <button class="btn btn-brand btn-full" onclick="expenses.add()">${icon('check', { size: 18 })}${t('save_expense')}</button>
    </div>`;
  },
  pickType(v) {
    this._formType = v;
    document.querySelectorAll('#exp-type-seg button').forEach(b => b.classList.toggle('active', b.dataset.v === v));
    document.getElementById('exp-when').innerHTML = v === 'rec'
      ? `<div class="field"><label class="lbl">${t('billing_day')}</label>
          <select class="in" id="exp-day">${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}</select></div>`
      : `<div class="field"><label class="lbl">${t('date')}</label><input class="in" type="date" id="exp-date" value="${App.mondayISO()}"></div>`;
  },
  async add() {
    const desc = document.getElementById('exp-desc').value.trim();
    const amount = App.readMoney('exp-amount');
    if (!desc) { App.toast(t('description') + '?'); return; }
    if (!amount) { App.toast(t('amount') + '?'); return; }
    const rec = this._formType === 'rec';
    try {
      await DB.add('expenses', {
        date: rec ? App.mondayISO() : document.getElementById('exp-date').value,
        description: desc, amount, isRecurring: rec,
        recurringDay: rec ? +document.getElementById('exp-day').value : null,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Expense save failed:', err);
      App.toast((err && err.message) ? err.message : 'Save failed');
      return;
    }
    this._formType = 'one';
    App.closeSheet(); App.refresh(); App.toast(t('save_expense'));
  },
  async del(id) { await DB.delete('expenses', id); App.refresh(); },
};
