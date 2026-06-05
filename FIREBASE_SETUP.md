# Firebase setup for La Gran Familia

1. Create a Firebase project on the Spark plan.
2. Add a Web app and paste its config into `www/js/firebase-config.js`.
3. Enable Authentication -> Email/Password.
4. Create the first owner account in Firebase Authentication.
   - Use the hidden email format, for example `owner@lagranfamilia.app`.
5. Publish `firestore.rules` in Firestore Rules.

After that, sign into the app with username `owner` and the password you created.
The app will create the matching admin profile document automatically on first owner login.
Admins can create worker/admin profiles from the Users page.

## Current auth boundary

This static app can create users and can remove their Firestore profile access.
Changing or deleting another person's Firebase Auth password requires a trusted Firebase Admin SDK endpoint, such as a Cloud Function.
