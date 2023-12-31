import type { AuthUser, CinemarcUser, CinemarcUserRank } from "../../models/user.model";
import admin from "firebase-admin";
import type { CinemarcResponse } from "../../models/api.model";
import { initializeFirebase } from "../firebase.server";
import { getTransport } from "../utils.server";
import { EMAIL_USER, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, FIREBASE_WEB_API_KEY, _ } from "$env/static/private";
import type { UserRecord } from "firebase-admin/lib/auth/user-record";

initializeFirebase();

export function getTokenGeneratorApp() {
  const APP_NAME = "custom-token-generation-app";
  const foundApp = admin.apps.find((app) => app && app.name === APP_NAME);
  if (foundApp) return foundApp;

  return admin.initializeApp({
    credential: admin.credential.cert({
      project_id: FIREBASE_PROJECT_ID,
      private_key: FIREBASE_PRIVATE_KEY,
      client_email: FIREBASE_CLIENT_EMAIL,
    } as any),
    databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`
  }, APP_NAME);
}

function sendInvitationEmail(email: string, userId: string): Promise<any> {
  const linkUrl = `https://cinemarc.vercel.app/register/${userId}`;
  return getTransport()
    .sendMail({
      to: email,
      html: `
        <p>Complete your profile with the link below</p>
        <a href="${linkUrl}">${linkUrl}</a>
      `,
      from: `Cinemarc <${EMAIL_USER}>`,
      subject: "Complete your profile",
    });
}

export async function createInvitation(email: string): Promise<CinemarcResponse> {
  try {
    await admin.auth().getUserByEmail(email);
    return { status: 412, message: "User already exists", data: null };
  } catch (error) {}

  const userOnDBSnap = await admin.firestore()
    .collection("users")
    .where("email", "==", email)
    .where("authStatus", "==", "invited")
    .get();
    
  const invitedUserDoc = userOnDBSnap.docs[0];
  if (invitedUserDoc) {
    await sendInvitationEmail(email, invitedUserDoc.id);
  } else {
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
      rank: "user",
      username: "",
    };
  
    await userDoc.set(userDB);
    await sendInvitationEmail(email, userDoc.id)
  }


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

  const userWithUsernameSnap = await admin.firestore().collection("users").where("username", "==", username).get();
  if (userWithUsernameSnap.docs.length) {
    return { status: 403, message: "Username is taken", data: null };
  }

  await admin.auth().createUser({ email, password, uid: userId });
  await admin.auth().setCustomUserClaims(userId, { rank: "user" });
  const userUpdateData: Partial<CinemarcUser> = {
    authStatus: "complete",
    isActive: true,
    username,
    avatarUrl: avatarUrl || null,
  };

  await userDoc.update(userUpdateData);
  
  return { status: 200, data: email, message: null };
}