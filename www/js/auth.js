const Auth = (() => {
  const cfg = window.LGF_FIREBASE_CONFIG || {};
  const configured = !!(cfg.apiKey && cfg.projectId && window.firebase);
  const emailDomain = window.LGF_AUTH_EMAIL_DOMAIN || 'lagranfamilia.app';
  let app = null;
  let auth = null;
  let firestore = null;
  let current = null;
  let pendingProfileUid = null;
  let pendingProfileEmail = null;
  const ADMIN_ACCESS_CODE = 'Ander';

  function cleanUsername(username) {
    return String(username || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }

  function usernameToEmail(username) {
    return `${cleanUsername(username)}@${emailDomain}`;
  }

  function cleanEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function profileUsername({ username, email }) {
    return cleanUsername(username || String(email || '').split('@')[0]);
  }

  async function loadProfile(user) {
    if (!user || !firestore) return null;
    const username = (user.email || '').split('@')[0];
    const snap = await firestore.collection('users').doc(user.uid).get();
    let profile = snap.exists ? snap.data() : null;
    if (!profile && (pendingProfileUid === user.uid || pendingProfileEmail === user.email)) {
      return null;
    }
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
    const email = String(username || '').includes('@') ? cleanEmail(username) : usernameToEmail(username);
    const cred = await auth.signInWithEmailAndPassword(email, password);
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

  function canCreateAdmin(adminAccessCode) {
    return String(adminAccessCode || '') === ADMIN_ACCESS_CODE;
  }

  function codedError(message, code) {
    const err = new Error(message);
    err.code = code;
    return err;
  }

  function profileForSignup({ name, username, email, role, adminAccessCode, createdAt, eulaAcceptedAt }) {
    const profile = {
      name,
      username: profileUsername({ username, email }),
      email: cleanEmail(email),
      role,
      createdAt,
      createdBy: null,
      eulaAcceptedAt,
      eulaVersion: '1.0',
    };
    if (role === 'admin') profile.adminAccessCode = adminAccessCode;
    return profile;
  }

  async function writeSignupProfile(user, data) {
    pendingProfileUid = user.uid;
    pendingProfileEmail = user.email;
    const doc = firestore.collection('users').doc(user.uid);
    await doc.set(data);
    if (data.role === 'admin') {
      await doc.update({ adminAccessCode: firebase.firestore.FieldValue.delete() });
    }
    pendingProfileUid = null;
    pendingProfileEmail = null;
    return loadProfile(user);
  }

  async function createUser({ name, username, email, password, role, adminAccessCode }) {
    if (!configured) return null;
    if (role === 'admin' && !canCreateAdmin(adminAccessCode)) {
      throw new Error('Invalid admin access code.');
    }
    email = cleanEmail(email);
    username = profileUsername({ username, email });
    const createdAt = new Date().toISOString();
    const secondary = firebase.initializeApp(window.LGF_FIREBASE_CONFIG, `user-create-${Date.now()}`);
    try {
      const cred = await secondary.auth().createUserWithEmailAndPassword(email, password);
      await firestore.collection('users').doc(cred.user.uid).set({
        name, username, email, role, createdAt,
        createdBy: current ? current.uid : null,
      });
      return { id: cred.user.uid, uid: cred.user.uid, name, username, email, role, createdAt };
    } finally {
      await secondary.delete();
    }
  }

  async function signUp({ name, username, email, password, role, adminAccessCode, eulaAcceptedAt }) {
    if (!configured) throw new Error('Firebase is not configured yet.');
    if (role === 'admin' && !canCreateAdmin(adminAccessCode)) {
      throw new Error('Invalid admin access code.');
    }
    email = cleanEmail(email);
    username = profileUsername({ username, email });
    const createdAt = new Date().toISOString();
    const profile = profileForSignup({ name, username, email, role, adminAccessCode, createdAt, eulaAcceptedAt });
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      return writeSignupProfile(cred.user, profile);
    } catch (err) {
      if (err && err.code === 'auth/email-already-in-use') {
        pendingProfileEmail = email;
        let cred = null;
        try {
          cred = await auth.signInWithEmailAndPassword(email, password);
        } catch (signInErr) {
          pendingProfileUid = null;
          pendingProfileEmail = null;
          throw codedError('Account already exists. Sign in or use Reset Password.', 'auth/email-already-in-use');
        }
        const snap = await firestore.collection('users').doc(cred.user.uid).get();
        if (snap.exists) {
          pendingProfileEmail = null;
          throw codedError('Account already exists. Sign in or use Reset Password.', 'auth/email-already-in-use');
        }
        try {
          return await writeSignupProfile(cred.user, profile);
        } catch (profileErr) {
          pendingProfileUid = null;
          pendingProfileEmail = null;
          throw profileErr;
        }
      }
      pendingProfileUid = null;
      pendingProfileEmail = null;
      if (auth.currentUser && auth.currentUser.email === email) {
        await auth.currentUser.delete().catch(() => {});
      }
      current = null;
      throw err;
    }
  }

  async function sendPasswordReset(email) {
    if (!configured) throw new Error('Firebase is not configured yet.');
    await auth.sendPasswordResetEmail(cleanEmail(email));
  }

  function canAccess(page) {
    if (!current) return false;
    if (current.role === 'worker') return page === 'orders';
    return true;
  }

  return {
    init, signIn, signOut, signUp, createUser, updatePassword, sendPasswordReset, canAccess,
    isConfigured: () => configured,
    db: () => firestore,
    user: () => current,
    isAdmin: () => current && current.role === 'admin',
    cleanUsername, cleanEmail, canCreateAdmin,
  };
})();
