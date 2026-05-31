const settings = {
  async render() {
    const theme = localStorage.getItem('theme') || 'light';
    const lang  = localStorage.getItem('lang')  || 'en';

    return `
    <div class="card">
      <h2>⚙️ ${t('settings')}</h2>
    </div>

    <div class="card">
      <h2>🎨 ${t('appearance')}</h2>
      <div class="setting-tiles">
        <div class="setting-tile ${theme==='light'?'active':''}" onclick="settings.setTheme('light')">
          <div class="tile-icon">☀️</div>
          <div class="tile-label">${t('light')}</div>
        </div>
        <div class="setting-tile ${theme==='dark'?'active':''}" onclick="settings.setTheme('dark')">
          <div class="tile-icon">🌙</div>
          <div class="tile-label">${t('dark')}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>🌐 ${t('language')}</h2>
      <div class="setting-tiles">
        <div class="setting-tile ${lang==='en'?'active':''}" onclick="settings.setLang('en')">
          <div class="tile-icon">🇺🇸</div>
          <div class="tile-label">English</div>
        </div>
        <div class="setting-tile ${lang==='es'?'active':''}" onclick="settings.setLang('es')">
          <div class="tile-icon">🇲🇽</div>
          <div class="tile-label">Español</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>📲 ${t('install_app')}</h2>
      <div id="install-android" style="display:none">
        <button class="btn btn-success" onclick="settings.installAndroid()" style="width:100%;margin-bottom:10px">
          📲 ${t('install_app')}
        </button>
      </div>
      <div id="install-ios" style="display:none;background:var(--surface-alt);border-radius:10px;padding:16px;border:1px solid var(--border)">
        <ol style="margin:0 0 0 20px;line-height:2;font-size:14px;color:var(--text-muted)">
          <li>Tap <strong>Share ⬆️</strong></li>
          <li>Tap <strong>"Add to Home Screen"</strong></li>
          <li>Tap <strong>"Add"</strong></li>
        </ol>
      </div>
      <div id="install-done" style="display:none;color:#27ae60;font-weight:600;font-size:14px">
        ✅ ${t('install_app')}!
      </div>
    </div>

    `;
  },

  mount() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                      || window.navigator.standalone;
    if (isStandalone) {
      document.getElementById('install-done').style.display = 'block';
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      document.getElementById('install-ios').style.display = 'block';
    } else if (window._installPrompt) {
      document.getElementById('install-android').style.display = 'block';
    } else {
      document.getElementById('install-ios').style.display = 'block';
    }
  },

  setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.getElementById('htmlRoot').dataset.theme = theme;
    App.nav('settings');
  },

  setLang(lang) {
    localStorage.setItem('lang', lang);
    applyTranslations();
    App.nav(App.getCurrentPage());
  },

  installAndroid() {
    if (window._installPrompt) window._installPrompt.prompt();
  }
};
