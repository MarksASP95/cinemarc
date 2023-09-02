import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import admin from "firebase-admin";
import type { UserRecord } from 'firebase-admin/lib/auth/user-record';

export const POST = (async (event) => {
  const { userId } = await event.request.json();

  if (!userId) throw error(400, { message: "User ID is required" });

  let userRecord: UserRecord;
  try {
    userRecord = await admin.auth().getUser(userId);
  } catch (_) {
    throw error(404, { message: "User not found" });
  }

  const userIsAdmin = userRecord.customClaims?.["rank"] === "admin";
  if (userIsAdmin) throw error(403, { message: "User is admin" });

  await admin.auth().setCustomUserClaims(userId, { isBlocked: true });
  await admin.firestore().collection("users").doc(userId).update({ isActive: false, isDeleted: true });

  return json({});
}) satisfies RequestHandler;