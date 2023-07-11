import admin from "firebase-admin";
import type { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { FIREBASE_SERVICE_ACCOUNT } from "$env/static/private";

export function initializeFirebase() {
  if (!admin.apps.length) {
		const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount as any),
			databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
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