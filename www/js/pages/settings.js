const settings = {
  async render() {
    const theme = localStorage.getItem('theme') || 'light';
    const lang = localStorage.getItem('lang') || 'en';
    const accent = localStorage.getItem('accent') || 'Pine';
    const me = Auth.user() || { name: 'Owner', username: 'admin', role: 'admin' };

    const tile = (active, ic, label, onclick) => `<button class="choice-tile ${active ? 'active' : ''}" onclick="${onclick}">${icon(ic, { size: 24 })}<span>${label}</span></button>`;
    const accentSwatch = name => {
      const hue = App.ACCENTS[name];
      const on = accent === name;
      return `<button onclick="App.setAccent('${name}')" class="tap" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;border:1.5px solid ${on ? 'var(--brand)' : 'var(--border)'};background:${on ? 'var(--brand-soft)' : 'var(--surface)'};border-radius:14px;padding:12px 6px;cursor:pointer">
        <span style="width:26px;height:26px;border-radius:999px;background:oklch(0.55 0.12 ${hue})"></span>
        <span style="font-size:12px;font-weight:600;color:${on ? 'var(--brand-ink)' : 'var(--muted)'}">${name}</span></button>`;
    };

    return `<div class="page">
      <div class="rise">${App.sectionHead('appearance')}
        <div class="choice-tiles">
          ${tile(theme === 'light', 'sun', t('light'), "App.setTheme('light')")}
          ${tile(theme === 'dark', 'moon', t('dark'), "App.setTheme('dark')")}
        </div></div>

      <div class="rise">${App.sectionHead('accent')}
        <div style="display:flex;gap:10px">${Object.keys(App.ACCENTS).map(accentSwatch).join('')}</div></div>

      <div class="rise">${App.sectionHead('language')}
        <div class="choice-tiles">
          ${tile(lang === 'en', 'globe', 'English', "App.setLang('en')")}
          ${tile(lang === 'es', 'globe', 'Español', "App.setLang('es')")}
        </div></div>

      <div class="rise">${App.sectionHead('account')}
        <div class="card flush">
          <div class="row">
            ${App.avatar(me.name || 'Owner', 'brand')}
            <div class="r-main"><div class="r-title">${App.esc(me.name || 'Owner')}</div>
              <div class="r-sub">${t('signed_in_as')} <span class="num">@${App.esc(me.username)}</span></div></div>
            ${App.badge(me.role === 'admin' ? t('admin') : t('worker'), me.role === 'admin' ? 'brand' : 'info', me.role === 'admin' ? 'shield' : 'users')}
          </div>
          <div class="row tap" onclick="App.toast(t('install_app'))">
            ${App.iconChip('download', 'neutral')}
            <div class="r-main"><div class="r-title">${t('install_app')}</div><div class="r-sub">iOS · Android</div></div>
            ${icon('chevronRight', { size: 17, cls: 'c-faint' })}
          </div>
          <div class="row tap" onclick="settings.openPasswordForm()">
            ${App.iconChip('key', 'brand')}
            <div class="r-main"><div class="r-title">${t('change_password')}</div></div>
            ${icon('chevronRight', { size: 17, cls: 'c-faint' })}
          </div>
        </div></div>

      <div class="rise">${App.sectionHead('data')}
        <div class="card flush">
          <div class="row tap" onclick="settings.loadSample()">
            ${App.iconChip('sparkle', 'info')}
            <div class="r-main"><div class="r-title">${t('load_sample')}</div></div>
            ${icon('chevronRight', { size: 17, cls: 'c-faint' })}
          </div>
          <div class="row tap" onclick="settings.reset()">
            ${App.iconChip('refresh', 'neg')}
            <div class="r-main"><div class="r-title" style="color:var(--neg)">${t('reset_data')}</div></div>
            ${icon('chevronRight', { size: 17, cls: 'c-faint' })}
          </div>
        </div></div>

      <button class="btn btn-danger-ghost btn-full" onclick="App.signOut()">${icon('logout', { size: 18 })}${t('sign_out')}</button>
      <div class="num" style="text-align:center;font-size:12px;color:var(--faint)">La Gran Familia · ${t('version')} 2.0</div>
    </div>`;
  },

  async loadSample() {
    await DB.seedDemo();
    localStorage.setItem('demoSeeded', '1');
    App.refresh(); App.toast(t('sample_loaded'));
  },
  async reset() {
    if (!confirm(t('reset_confirm'))) return;
    await DB.clearAll();
    await DB.seedAdmin();
    localStorage.setItem('demoSeeded', '1');
    App.toast(t('data_reset'));
    App.nav('dashboard');
  },
  openPasswordForm() {
    App.openSheet({
      title: t('change_password'),
      body: `<div style="padding-bottom:8px">
        <div class="field"><label class="lbl">${t('new_password')}</label><input class="in" id="own-pass" type="password" autocomplete="new-password" placeholder="••••"></div>
        <button class="btn btn-brand btn-full" onclick="settings.changeOwnPassword()">${icon('check', { size: 18 })}${t('update_password')}</button>
      </div>`
    });
  },
  async changeOwnPassword() {
    const pass = document.getElementById('own-pass').value;
    if (!pass || pass.length < 6) return;
    await Auth.updatePassword(pass);
    App.closeSheet();
    App.toast(t('update_password'));
  },
};
