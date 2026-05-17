const users = {
  async render() {
    const all = await DB.getAll('users');
    const currentUser = App.getUser();
    const MAX_ADMINS = 3;
    const adminCount = all.filter(u => u.role === 'admin').length;

    return `
    <div class="card">
      <h2>👥 User Accounts</h2>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
        Admins: ${adminCount}/${MAX_ADMINS} &nbsp;·&nbsp; Workers: ${all.filter(u=>u.role==='worker').length}
      </p>

      <form onsubmit="users.create(event)" style="background:var(--surface-alt);border-radius:8px;padding:14px;margin-bottom:20px;border:1px solid var(--border)">
        <h3 style="font-size:15px;margin-bottom:12px">+ Create User</h3>
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="u-name" placeholder="Name" required>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" id="u-username" placeholder="username (no spaces)" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="u-pass" placeholder="Password" required>
        </div>
        <div class="form-group">
          <label>Role</label>
          <select id="u-role">
            <option value="worker">Worker</option>
            ${adminCount < MAX_ADMINS ? '<option value="admin">Admin</option>' : ''}
          </select>
          ${adminCount >= MAX_ADMINS ? `<p style="font-size:12px;color:var(--text-muted);margin-top:6px">Max ${MAX_ADMINS} admins reached.</p>` : ''}
        </div>
        <button type="submit" class="btn btn-success">Create Account</button>
      </form>

      <table><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Actions</th></tr></thead><tbody>
        ${all.map(u=>`<tr>
          <td style="font-weight:600">${u.name}</td>
          <td style="color:var(--text-muted)">@${u.username}</td>
          <td><span class="badge ${u.role==='admin'?'badge-admin':'badge-worker'}">${u.role}</span></td>
          <td>
            ${u.id !== currentUser?.id ? `<button class="btn btn-danger btn-sm" onclick="users.del(${u.id})">Delete</button>` : '<span style="color:var(--text-muted);font-size:12px">You</span>'}
          </td>
        </tr>`).join('')}
      </tbody></table>
    </div>

    <div class="card">
      <h2>🔑 Change Password</h2>
      <form onsubmit="users.changePass(event)" style="max-width:360px">
        <div class="form-group">
          <label>User</label>
          <select id="cp-user">
            ${all.map(u=>`<option value="${u.id}">${u.name} (@${u.username})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>New Password</label>
          <input type="password" id="cp-pass" placeholder="New password" required>
        </div>
        <button type="submit" class="btn btn-primary">Update Password</button>
      </form>
    </div>`;
  },

  async create(e) {
    e.preventDefault();
    const all = await DB.getAll('users');
    const username = document.getElementById('u-username').value.trim().toLowerCase();

    if (all.some(u => u.username === username)) {
      alert('Username already taken.');
      return;
    }

    const role = document.getElementById('u-role').value;
    if (role === 'admin' && all.filter(u => u.role === 'admin').length >= 3) {
      alert('Maximum 3 admin accounts allowed.');
      return;
    }

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
    if (!confirm('Delete this user account?')) return;
    await DB.delete('users', id);
    App.nav('users');
  },

  async changePass(e) {
    e.preventDefault();
    const id = +document.getElementById('cp-user').value;
    const user = await DB.get('users', id);
    if (!user) return;
    await DB.put('users', { ...user, password: document.getElementById('cp-pass').value });
    alert('Password updated!');
    document.getElementById('cp-pass').value = '';
  }
};
