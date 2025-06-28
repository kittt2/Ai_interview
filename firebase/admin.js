// firebase/admin.js
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Ensure required environment variables are present
if (!process.env.Fproject_id || !process.env.Fclient_email || !process.env.Fprivate_key) {
  throw new Error("❌ Missing Firebase Admin environment variables.");
}

// Initialize Firebase Admin app
const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: import.meta.env.VITE_Fproject_id,
        clientEmail: import.meta.env.VITE_Fclient_email,
        privateKey: import.meta.env.VITE_Fprivate_key.replace(/\\n/g, '\n'),
      }),
    })
  : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);