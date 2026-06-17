const users = {
  async render() {
    const all = (await DB.getAll('users')).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const adminCount = all.filter(u => u.role === 'admin').length;
    const selfName = (Auth.user() || {}).username || 'admin';

    return `<div class="page">
      <div class="card rise" style="display:flex;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="iconchip t-brand" style="width:42px;height:42px">${icon('shield', { size: 22 })}</div>
          <div><div style="font-size:15px;font-weight:680">${all.length} ${t('members')}</div>
            <div style="font-size:12.5px;color:var(--muted)">${t('admins')} <span class="num" style="font-weight:600">${adminCount}/3</span></div></div>
        </div>
        <button class="btn btn-soft btn-sm" onclick="App.openForm('user')">${icon('plus', { size: 15 })}${t('add')}</button>
      </div>

      <div class="card flush rise">
        ${all.map((u, i) => `<div class="row">
          ${App.avatar(u.name || u.username, App.avTone(i))}
          <div class="r-main">
            <div class="r-title">${App.esc(u.name || u.username)}${u.username === selfName ? ` <span class="c-brand" style="font-weight:600">· ${t('you')}</span>` : ''}</div>
            <div class="r-sub num">@${App.esc(u.username)} · ${App.fmtDateShort(u.createdAt)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${App.badge(u.role === 'admin' ? t('admin') : t('worker'), u.role === 'admin' ? 'brand' : 'info', u.role === 'admin' ? 'shield' : 'users')}
            ${u.username === selfName ? '' : `<button class="icon-btn" onclick='users.del(${JSON.stringify(u.id)})'>${icon('trash', { size: 16 })}</button>`}
          </div>
        </div>`).join('')}
      </div>

      <div class="rise">
        ${App.sectionHead('role_perms')}
        <div class="card" style="display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;gap:12px">${App.iconChip('shield', 'brand')}
            <div style="flex:1"><div style="font-size:14px;font-weight:680">${t('admin')} <span style="color:var(--faint);font-weight:500">· max 3</span></div>
              <div style="font-size:12.5px;color:var(--muted);margin-top:2px">${t('admin_perm')}</div></div></div>
          <div style="display:flex;gap:12px">${App.iconChip('users', 'info')}
            <div style="flex:1"><div style="font-size:14px;font-weight:680">${t('worker')}</div>
              <div style="font-size:12.5px;color:var(--muted);margin-top:2px">${t('worker_perm')}</div></div></div>
          <div style="font-size:12.5px;color:var(--muted);line-height:1.45">${t('password_reset_note')}</div>
        </div>
      </div>
    </div>`;
  },

  _role: 'worker',
  formHTML() {
    this._role = 'worker';
    return `<div style="padding-bottom:8px">
      <div class="field"><label class="lbl">${t('full_name')}</label><input class="in" id="usr-name" placeholder="${t('full_name')}"></div>
      <div class="field"><label class="lbl">${t('username')}</label><input class="in" id="usr-username" autocapitalize="none"></div>
      <div class="field"><label class="lbl">${t('email')}</label><input class="in" id="usr-email" type="email" autocapitalize="none" autocomplete="email" placeholder="${t('email')}"></div>
      <div class="field"><label class="lbl">${t('new_password')}</label><input class="in" id="usr-pass" type="password" placeholder="••••"></div>
      <div class="field"><label class="lbl">${t('role')}</label>
        <div class="segmented" id="usr-role-seg">
          <button class="active" data-v="worker" onclick="users.pickRole('worker')">${t('worker')}</button>
          <button data-v="admin" onclick="users.pickRole('admin')">${t('admin')}</button>
        </div></div>
      <div class="field" id="usr-admin-code-wrap" style="display:none">
        <label class="lbl">${t('admin_access_code')}</label>
        <input class="in" id="usr-admin-code" type="password" autocomplete="off" placeholder="${t('admin_access_code')}">
      </div>
      <button class="btn btn-brand btn-full" onclick="users.create()">${icon('check', { size: 18 })}${t('add_user')}</button>
    </div>`;
  },
  pickRole(r) {
    this._role = r;
    document.querySelectorAll('#usr-role-seg button').forEach(b => b.classList.toggle('active', b.dataset.v === r));
    const code = document.getElementById('usr-admin-code-wrap');
    if (code) code.style.display = r === 'admin' ? 'block' : 'none';
  },
  async create() {
    const name = document.getElementById('usr-name').value.trim();
    const username = Auth.cleanUsername(document.getElementById('usr-username').value);
    const email = Auth.cleanEmail(document.getElementById('usr-email').value);
    if (!name || !username || !email) return;
    if (!email.includes('@')) {
      App.toast(t('invalid_email'));
      return;
    }
    let role = this._role;
    const adminAccessCode = document.getElementById('usr-admin-code') ? document.getElementById('usr-admin-code').value.trim() : '';
    if (role === 'admin') {
      if (!Auth.canCreateAdmin(adminAccessCode)) {
        App.toast(t('invalid_admin_code'));
        return;
      }
      const adminCount = (await DB.getAll('users')).filter(u => u.role === 'admin').length;
      if (adminCount >= 3) {
        App.toast(t('admin_limit_reached'));
        return;
      }
    }
    const password = document.getElementById('usr-pass').value || 'changeme';
    if (Auth.isConfigured()) await Auth.createUser({ name, username, email, password, role, adminAccessCode });
    else await DB.add('users', { name, username, email, password, role, createdAt: new Date().toISOString() });
    App.closeSheet(); App.refresh(); App.toast(t('add_user'));
  },
  async del(id) { await DB.delete('users', id); App.refresh(); },
};
