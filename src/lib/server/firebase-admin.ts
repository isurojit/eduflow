import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

let adminApp: App | null = null;

export function firebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY);
}

export function getFirebaseAdminApp() {
  if (!firebaseAdminConfigured()) return null;
  if (adminApp) return adminApp;
  adminApp = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
  return adminApp;
}

export async function verifyFirebaseBearer(request: Request) {
  const app = getFirebaseAdminApp();
  if (!app) throw new Error("Firebase Admin is not configured on the server.");
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Authentication required.");
  return getAuth(app).verifyIdToken(header.slice(7));
}

export function firebaseBucket() {
  const app = getFirebaseAdminApp();
  if (!app || !process.env.FIREBASE_STORAGE_BUCKET) return null;
  return getStorage(app).bucket(process.env.FIREBASE_STORAGE_BUCKET);
}
