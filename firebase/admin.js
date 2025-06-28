// firebase/admin.js
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: import.meta.env.Fproject_id,
        clientEmail: import.meta.env.Fclient_email,
        privateKey: import.meta.env.Fprivate_key?.replace(/\\n/g, '\n'),
      }),
    })
  : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);