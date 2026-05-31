const users = {
  async render() {
    const all = await DB.getAll('users');
    const currentUser = App.getUser();
    const MAX_ADMINS = 3;
    const adminCount = all.filter(u => u.role === 'admin').length;

    return `
    <div class="card">
      <h2>👥 ${t('user_accounts')}</h2>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
        ${t('admin')}: ${adminCount}/${MAX_ADMINS} &nbsp;·&nbsp; ${t('worker')}: ${all.filter(u=>u.role==='worker').length}
      </p>

      <form onsubmit="users.create(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">${t('create_user')}</h3>
        <div class="form-group">
          <label>${t('name')}</label>
          <input type="text" id="u-name" placeholder="${t('name')}" required>
        </div>
        <div class="form-group">
          <label>${t('username')}</label>
          <input type="text" id="u-username" placeholder="${t('username')}" required>
        </div>
        <div class="form-group">
          <label>${t('password')}</label>
          <input type="password" id="u-pass" placeholder="${t('password')}" required>
        </div>
        <div class="form-group">
          <label>${t('role')}</label>
          <select id="u-role">
            <option value="worker">${t('worker')}</option>
            ${adminCount < MAX_ADMINS ? `<option value="admin">${t('admin')}</option>` : ''}
          </select>
        </div>
        <button type="submit" class="btn btn-success">${t('create_account')}</button>
      </form>

      <table><thead><tr><th>${t('name')}</th><th>${t('username')}</th><th>${t('role')}</th><th></th></tr></thead><tbody>
        ${all.map(u=>`<tr>
          <td style="font-weight:600">${u.name}</td>
          <td style="color:var(--text-muted)">@${u.username}</td>
          <td><span class="badge ${u.role==='admin'?'badge-admin':'badge-worker'}">${t(u.role)}</span></td>
          <td>${u.id !== currentUser?.id ? `<button class="btn btn-danger btn-sm" onclick="users.del(${u.id})">${t('delete')}</button>` : ''}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>

    <div class="card">
      <h2>🔑 ${t('change_password')}</h2>
      <form onsubmit="users.changePass(event)" style="max-width:360px">
        <div class="form-group">
          <select id="cp-user">
            ${all.map(u=>`<option value="${u.id}">${u.name} (@${u.username})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <input type="password" id="cp-pass" placeholder="${t('new_password')}" required>
        </div>
        <button type="submit" class="btn btn-primary">${t('update_password')}</button>
      </form>
    </div>`;
  },

  async create(e) {
    e.preventDefault();
    const all = await DB.getAll('users');
    const username = document.getElementById('u-username').value.trim().toLowerCase();
    if (all.some(u => u.username === username)) { alert(t('username') + ' taken.'); return; }
    const role = document.getElementById('u-role').value;
    if (role === 'admin' && all.filter(u => u.role === 'admin').length >= 3) { alert('Max 3 admins.'); return; }
    await DB.add('users', {
      name:      document.getElementById('u-name').value.trim(),
      username,
      password:  document.getElementById('u-pass').value,
      role,
      createdAt: new Date().toISOString()
    });
    App.nav('users');
  },

  async del(id) {
    if (!confirm(t('delete') + '?')) return;
    await DB.delete('users', id);
    App.nav('users');
  },

  async changePass(e) {
    e.preventDefault();
    const id = +document.getElementById('cp-user').value;
    const user = await DB.get('users', id);
    if (!user) return;
    await DB.put('users', { ...user, password: document.getElementById('cp-pass').value });
    alert(t('update_password') + '!');
    document.getElementById('cp-pass').value = '';
  }
};
