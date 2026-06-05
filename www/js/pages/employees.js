const employees = {
  async render() {
    const [emps, deds] = await Promise.all([DB.getAll('employees'), DB.getAll('deductions')]);
    const gross = emps.reduce((s, e) => s + (+e.weeklyPay || 0), 0);
    const ded = deds.reduce((s, d) => s + (+d.amount || 0), 0);
    const net = gross - ded;
    const dedCount = id => deds.filter(d => d.employeeId === id).length;

    return `<div class="page">
      <div class="card rise" style="padding:0">
        <div class="grid-3">
          ${[['gross_pay', gross, 'c-text'], ['deductions', ded, 'c-neg'], ['net_payroll', net, 'c-pos']].map((m, i) => `
            <div style="padding:16px 14px;${i < 2 ? 'border-right:1px solid var(--hairline)' : ''}">
              <div class="metric-label" style="margin-bottom:6px">${t(m[0])}</div>
              <span class="money ${m[2]}" style="font-size:17px">${App.fmtMoney(m[1])}</span>
            </div>`).join('')}
        </div>
      </div>

      <button class="btn btn-brand btn-full" onclick="App.openForm('employee')">${icon('plus', { size: 18 })}${t('add_employee')}</button>

      <div class="card flush rise">
        ${emps.length ? emps.map((e, i) => {
          const dc = dedCount(e.id);
          return `<div class="row tap" onclick="employees.openDeductions(${e.id})">
            ${App.avatar(e.name, App.avTone(i))}
            <div class="r-main"><div class="r-title">${App.esc(e.name)}</div>
              <div class="r-sub">${dc ? `${dc} ${t('deductions').toLowerCase()}` : t('weekly_pay')}</div></div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="money c-pos" style="font-size:15px">${App.fmtMoney(e.weeklyPay)}</span>
              ${icon('chevronRight', { size: 17, cls: 'c-faint' })}
            </div>
          </div>`;
        }).join('') : App.emptyState('employees', 'no_employees')}
      </div>
    </div>`;
  },

  formHTML() {
    return `<div style="padding-bottom:8px">
      <div class="field"><label class="lbl">${t('full_name')}</label><input class="in" id="emp-name" placeholder="${t('full_name')}"></div>
      <div class="field"><label class="lbl">${t('weekly_pay')}</label>${App.moneyField('emp-pay')}</div>
      <button class="btn btn-brand btn-full" onclick="employees.add()">${icon('check', { size: 18 })}${t('add_employee')}</button>
    </div>`;
  },
  async add() {
    const name = document.getElementById('emp-name').value.trim();
    if (!name) return;
    await DB.add('employees', { name, weeklyPay: App.readMoney('emp-pay'), createdAt: new Date().toISOString() });
    App.closeSheet(); App.refresh(); App.toast(t('add_employee'));
  },
  async del(id) {
    const deds = await DB.getAll('deductions');
    for (const d of deds.filter(x => x.employeeId === id)) await DB.delete('deductions', d.id);
    await DB.delete('employees', id);
    App.closeSheet(); App.refresh();
  },

  async openDeductions(id) {
    App.openSheet({ title: t('deductions'), body: await this._dedBody(id) });
  },
  async _dedBody(id) {
    const [emps, deds] = await Promise.all([DB.getAll('employees'), DB.getAll('deductions')]);
    const emp = emps.find(e => e.id === id);
    if (!emp) return '';
    const list = deds.filter(d => d.employeeId === id);
    const totalDed = list.reduce((s, d) => s + (+d.amount), 0);
    return `<div style="padding-bottom:8px" id="ded-wrap" data-emp="${id}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        ${App.avatar(emp.name, 'brand')}
        <div style="flex:1"><div style="font-weight:680;font-size:16px">${App.esc(emp.name)}</div>
          <div style="font-size:12.5px;color:var(--muted)">${t('net_pay')}: <span class="money c-pos">${App.fmtMoney(emp.weeklyPay - totalDed)}</span></div></div>
      </div>
      <div class="card flush" style="margin-bottom:14px">
        ${list.length ? list.map(d => `<div class="row">
          ${App.iconChip('expenses', 'neg', { sm: true, icon: 16 })}
          <div class="r-main"><div class="r-title">${App.esc(d.description)}</div></div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="money c-neg" style="font-size:14.5px">${App.fmtMoney(d.amount)}</span>
            <button class="icon-btn" onclick="employees.delDeduction(${d.id})">${icon('trash', { size: 16 })}</button></div>
        </div>`).join('') : App.emptyState('check', 'no_deductions')}
      </div>
      <div style="display:flex;gap:10px;align-items:flex-end">
        <div style="flex:1"><label class="lbl">${t('description')}</label><input class="in" id="ded-desc" placeholder="…"></div>
        <div style="width:120px"><label class="lbl">${t('amount')}</label>${App.moneyField('ded-amount')}</div>
      </div>
      <button class="btn btn-soft btn-full" style="margin-top:8px" onclick="employees.addDeduction(${id})">${icon('plus', { size: 18 })}${t('add_deduction')}</button>
    </div>`;
  },
  async addDeduction(id) {
    const desc = document.getElementById('ded-desc').value.trim();
    const amount = App.readMoney('ded-amount');
    if (!desc || !amount) return;
    const emp = (await DB.getAll('employees')).find(e => e.id === id);
    await DB.add('deductions', { employeeId: id, employeeName: emp ? emp.name : '', description: desc, amount, createdAt: new Date().toISOString() });
    document.getElementById('sheet').querySelector('.sheet-body').innerHTML = await this._dedBody(id);
    App.refresh();
  },
  async delDeduction(dedId) {
    const id = +document.getElementById('ded-wrap').dataset.emp;
    await DB.delete('deductions', dedId);
    document.getElementById('sheet').querySelector('.sheet-body').innerHTML = await this._dedBody(id);
    App.refresh();
  },
};
