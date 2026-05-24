import admin from 'firebase-admin';

import fs from 'fs';


// Read service account JSON manually
const serviceAccount = JSON.parse(
  fs.readFileSync(
    new URL('../config/serviceAccountKey.json', import.meta.url)
  )
);


// Initialize Firebase Admin
if (!admin.apps.length) {

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

}


// Export auth
export const adminAuth = admin.auth();

export default admin;