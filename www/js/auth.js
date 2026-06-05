const Auth = (() => {
  const cfg = window.LGF_FIREBASE_CONFIG || {};
  const configured = !!(cfg.apiKey && cfg.projectId && window.firebase);
  const emailDomain = window.LGF_AUTH_EMAIL_DOMAIN || 'lagranfamilia.app';
  let app = null;
  let auth = null;
  let firestore = null;
  let current = null;

  function cleanUsername(username) {
    return String(username || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }

  function usernameToEmail(username) {
    return `${cleanUsername(username)}@${emailDomain}`;
  }

  async function loadProfile(user) {
    if (!user || !firestore) return null;
    const username = (user.email || '').split('@')[0];
    const snap = await firestore.collection('users').doc(user.uid).get();
    let profile = snap.exists ? snap.data() : null;
    if (!profile && username === 'owner') {
      profile = {
        username: 'owner',
        name: 'Owner',
        role: 'admin',
        createdAt: new Date().toISOString(),
        bootstrap: true,
      };
      await firestore.collection('users').doc(user.uid).set(profile);
    }
    if (!profile) {
      current = null;
      await auth.signOut();
      return null;
    }
    current = {
      uid: user.uid,
      username: profile.username || username,
      name: profile.name || username,
      role: profile.role || 'worker',
      email: user.email,
      createdAt: profile.createdAt || new Date().toISOString(),
    };
    return current;
  }

  async function init() {
    if (!configured) return null;
    if (!app) {
      app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg);
      auth = firebase.auth();
      firestore = firebase.firestore();
      firestore.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    }
    return new Promise(resolve => {
      auth.onAuthStateChanged(async user => resolve(user ? loadProfile(user) : (current = null)));
    });
  }

  async function signIn(username, password) {
    if (!configured) throw new Error('Firebase is not configured yet.');
    const cred = await auth.signInWithEmailAndPassword(usernameToEmail(username), password);
    const profile = await loadProfile(cred.user);
    if (!profile) throw new Error('No active app profile exists for this account.');
    return profile;
  }

  async function signOut() {
    if (auth) await auth.signOut();
    current = null;
  }

  async function updatePassword(newPassword) {
    if (!auth || !auth.currentUser) throw new Error('No signed-in user.');
    await auth.currentUser.updatePassword(newPassword);
  }

  async function createUser({ name, username, password, role }) {
    if (!configured) return null;
    const email = usernameToEmail(username);
    const createdAt = new Date().toISOString();
    const secondary = firebase.initializeApp(window.LGF_FIREBASE_CONFIG, `user-create-${Date.now()}`);
    try {
      const cred = await secondary.auth().createUserWithEmailAndPassword(email, password);
      await firestore.collection('users').doc(cred.user.uid).set({
        name, username: cleanUsername(username), role, createdAt,
        createdBy: current ? current.uid : null,
      });
      return { id: cred.user.uid, uid: cred.user.uid, name, username: cleanUsername(username), role, createdAt };
    } finally {
      await secondary.delete();
    }
  }

  function canAccess(page) {
    if (!current) return false;
    if (current.role === 'worker') return page === 'orders';
    return true;
  }

  return {
    init, signIn, signOut, createUser, updatePassword, canAccess,
    isConfigured: () => configured,
    db: () => firestore,
    user: () => current,
    isAdmin: () => current && current.role === 'admin',
    cleanUsername,
  };
})();
