import admin from "firebase-admin";
import type { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY,FIREBASE_CLIENT_EMAIL } from "$env/static/private";

export function initializeFirebase() {
  if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.cert({
				project_id: FIREBASE_PROJECT_ID,
				private_key: FIREBASE_PRIVATE_KEY,
				client_email: FIREBASE_CLIENT_EMAIL,
			} as any),
			databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`
		});
	}
}

export async function decodeToken(token: string): Promise<DecodedIdToken | null> {
	if (!token || token === 'null' || token === 'undefined') return null;
	try {
		initializeFirebase();
		return await admin.auth().verifyIdToken(token);
	} catch (err) {
		return null;
	}
}