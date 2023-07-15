import { error, redirect } from '@sveltejs/kit';
import * as admin from "firebase-admin";
import type { CinemarcUser } from '../../../../models/user.model.js';
import { initializeFirebase } from '../../../../server/firebase.server.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { id: userId } = params;

  initializeFirebase();
  const userSnap = await admin.firestore().collection("users").doc(userId).get();
  if (!userSnap.exists) {
    throw redirect(308, "/pieces");
  }

  const user = userSnap.data() as CinemarcUser;
  if (user.authStatus !== "invited") {
    throw redirect(308, "/pieces");
  }

  return {
    uid: userId,
    email: user.email,
  }
}