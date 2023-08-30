import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import admin from "firebase-admin";
import type { UserRecord } from 'firebase-admin/lib/auth/user-record';

export const POST = (async (event) => {
  const { userId, block, unblock } = await event.request.json();
  if (block === unblock) throw error(400, { message: "No action was given" });
  if (typeof block !== "boolean" && typeof unblock !== "boolean") 
    throw error(400, { message: "No action was given" });

  if (!userId) throw error(400, { message: "User ID is required" });

  let userRecord: UserRecord;
  try {
    userRecord = await admin.auth().getUser(userId);
  } catch (_) {
    throw error(404, { message: "User not found" });
  }

  const userIsAdmin = userRecord.customClaims?.["rank"] === "admin";
  if (userIsAdmin) throw error(403, { message: "User is admin" });

  const userIsBlocked = userRecord.customClaims?.["isBlocked"] === true;
  if (userIsBlocked && block) throw error(412, { message: "User is already blocked" });
  if (!userIsBlocked && unblock) throw error(412, { message: "User is not blocked" });

  await admin.auth().setCustomUserClaims(userId, { isBlocked: !!block });
  await admin.firestore().collection("users").doc(userId).update({ isActive: !block });

  return json({ blocked: !!block });
}) satisfies RequestHandler;