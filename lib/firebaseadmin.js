import { initializeApp, getApps, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  if (process.env.FIREBASE_CLIENT_EMAIL) {
    // Vercel / Local: use service account credentials
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // GCP Cloud Run: uses Application Default Credentials
    initializeApp({ credential: applicationDefault() });
  }
}

export const db = getFirestore();
export const adminAuth = getAuth();
