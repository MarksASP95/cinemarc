import type { AuthUser, CinemarcUser, CinemarcUserRank } from "../../models/user.model";
import * as admin from "firebase-admin";
import type { CinemarcResponse } from "../../models/api.model";
import { initializeFirebase } from "../firebase.server";
import { getTransport } from "../utils.server";
import { EMAIL_USER, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, FIREBASE_WEB_API_KEY, _ } from "$env/static/private";
import type { UserRecord } from "firebase-admin/lib/auth/user-record";

initializeFirebase();

function getTokenGeneratorApp() {
  const APP_NAME = "custom-token-generation-app";
  const foundApp = admin.apps.find((app) => app && app.name === APP_NAME);
  if (foundApp) return foundApp;

  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: FIREBASE_PROJECT_ID,
      private_key: FIREBASE_PRIVATE_KEY,
      client_email: FIREBASE_CLIENT_EMAIL,
    } as any),
    databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`
  }, APP_NAME);
}

export async function signIn(email: string, password: string): Promise<CinemarcResponse> {
  const URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`;
  // const securityResponse = await encrypt("JSON", { email: email, password: pass}, ["email", "password"])
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
    return { status: 401, data: null, message: "Wrong email or password" };
  }

  let authUser: UserRecord;
  try {
    authUser = await admin.auth().getUserByEmail(email);
  } catch (error) {
    return { status: 404, data: null, message: "User does not exist" };
  }

  const app = getTokenGeneratorApp();
  if (!app) return { status: 500, data: null, message: "Server could not respond" };
  const token = await app
    .auth()
    .createCustomToken(authUser.uid);

  return { status: 200, data: { token }, message: null };
}

export async function createInvitation(email: string, rank: CinemarcUserRank): Promise<CinemarcResponse> {
  try {
    await admin.auth().getUserByEmail(email);
    return { status: 412, message: "User already exists", data: null };
  } catch (error) {}

  const userDoc = admin.firestore().collection("users").doc();
  const userDB: CinemarcUser = {
    authStatus: "invited",
    avatarUrl: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    deletedAt: null,
    email,
    id: userDoc.id,
    isActive: false,
    isDeleted: false,
    rank,
    username: "",
  };

  await userDoc.set(userDB);
  
  const linkUrl = `https://cinemarc.vercel.app/register/${userDoc.id}`;

  await getTransport()
    .sendMail({
      to: email,
      html: `
        <p>Complete your profile with the link below</p>
        <a href="${linkUrl}">${linkUrl}</a>
      `,
      from: `Cinemarc <${EMAIL_USER}>`,
      subject: "Complete your profile",
    });

  return { status: 200, data: null, message: null };
}

export async function createAuthUserWithInvitation(userId: string, password: string, username: string, avatarUrl?: string): Promise<CinemarcResponse<string>> {
  const userDoc = admin.firestore().collection("users").doc(userId);
  const userDBSnap = await userDoc.get();
  if (!userDBSnap.exists) return { status: 404, message: "Invitation does not exist", data: null };

  const { email, authStatus } = userDBSnap.data() as CinemarcUser;
  if (authStatus !== "invited") return { status: 412, message: "User does not has available invitation", data: null };

  try {
    await admin.auth().getUserByEmail(email);
    return { status: 412, message: "User already exists", data: null };
  } catch (error) {}

  await admin.auth().createUser({ email, password, uid: userId });
  const userUpdateData: Partial<CinemarcUser> = {
    authStatus: "complete",
    isActive: true,
    username,
    avatarUrl: avatarUrl || null,
  };

  await userDoc.update(userUpdateData);
  
  return { status: 200, data: email, message: null };
}