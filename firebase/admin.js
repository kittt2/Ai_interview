// firebase/admin.js
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!process.env.Fproject_id || !process.env.Fclient_email || !process.env.Fprivate_key) {
  throw new Error("❌ Missing Firebase Admin environment variables.");
}

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.Fproject_id,
        clientEmail: process.env.Fclient_email,
        privateKey: process.env.Fprivate_key.replace(/\\n/g, '\n'),
      }),
    })
  : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);