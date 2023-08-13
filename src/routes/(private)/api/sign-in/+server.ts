import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAuthUserWithInvitation, createInvitation, getTokenGeneratorApp } from '../../../../server/controllers/auth.controller';
import type { CinemarcUser, CinemarcUserRank } from '../../../../models/user.model';
import { checkPassword, checkUsername } from '../../../../constants/user.const';
import { FIREBASE_WEB_API_KEY } from '$env/static/private';
import { initializeFirebase } from '../../../../server/firebase.server';
import admin from "firebase-admin";
import type { UserRecord } from 'firebase-admin/lib/auth/user-record';

initializeFirebase();

export const POST = (async (event) => {
  const { usernameOrEmail, password }
    : { usernameOrEmail: string, password: string} 
    = await event.request.json();

  const isEmail = usernameOrEmail.includes("@");

  let email: string;
  if (isEmail) {
    email = usernameOrEmail;
  } else {
    const userSnap = await admin.firestore().collection("users").where("username", "==", usernameOrEmail).get();
    if (userSnap.docs[0]) {
      email = (userSnap.docs[0].data() as CinemarcUser).email;
    } else {
      throw error(401, { message: "Wrong email or password" });
    }
  }
  
  const URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`;
  const reqBody = JSON.stringify({
    email,
    password,
    returnSecureToken: true
  });

  const response = await fetch(
      URL,
      {
          method: "POST",
          headers: {
              "content-type": "application/json"
          },
          body: reqBody,
      }
  );
  
  const data = await response.json();

  if (data.error) {
    throw error(401, { message: "Wrong email or password" });
  }

  let authUser: UserRecord;
  try {
    authUser = await admin.auth().getUserByEmail(email);
  } catch (e) {
    throw error(401, { message: "Wrong email or password" });
  }

  const app = getTokenGeneratorApp();
  if (!app) throw error(500, { message: "Server could not respond" });
  const token = await app
    .auth()
    .createCustomToken(authUser.uid);

  event.cookies.set('cinemarc-auth-token', token, { httpOnly: true, secure: true, path: '/' });

  return json({ token });
}) satisfies RequestHandler;