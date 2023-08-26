import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAuthUserWithInvitation, createInvitation, getTokenGeneratorApp } from '../../../../server/controllers/auth.controller';
import type { CinemarcUser, CinemarcUserRank, SignInResult } from '../../../../models/user.model';
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
    throw error(401, { message: <SignInResult>"wrong_credentials" });
  }

  let authUser: UserRecord;
  try {
    authUser = await admin.auth().getUserByEmail(email);
  } catch (e) {
    throw error(401, { message: <SignInResult>"wrong_credentials" });
  }

  const cinemarcUserSnap = await admin.firestore().collection("users").doc(authUser.uid).get();
  if (!cinemarcUserSnap.exists) throw error(403, { message: <SignInResult>"user_does_not_exist" });

  const cinemarcUser = cinemarcUserSnap.data() as CinemarcUser;
  if (!cinemarcUser.isActive || cinemarcUser.isDeleted) {
    throw error(403, { message: <SignInResult>"user_not_active" });
  }
  
  const app = getTokenGeneratorApp();
  if (!app) throw error(500, { message: <SignInResult>"server_could_not_respond" });
  const token = await app
    .auth()
    .createCustomToken(authUser.uid);

  event.cookies.set('cinemarc-auth-token', token, { httpOnly: true, secure: true, path: '/' });

  return json({ token, message: <SignInResult>"success" });
}) satisfies RequestHandler;