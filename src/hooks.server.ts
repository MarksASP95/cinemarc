import { error, type Handle, type RequestEvent } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import admin from "firebase-admin";
import type { CinemarcUser, CinemarcUserRank } from './models/user.model';
import { initializeFirebase } from './server/firebase.server';

initializeFirebase();

async function checkAuthentication(
  event: RequestEvent<Partial<Record<string, string>>, string | null>,
  { rank }: { rank: CinemarcUserRank } = { rank: "user" },
  throwUnauthorized = true,
): Promise<boolean> {
  const authHeader = event.request.headers.get("Authorization");
  if (!authHeader) {
    if (throwUnauthorized) throw error(403, { message: "Unauthorized " });
    return false;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (rank === "admin") {
      const { uid } = decodedToken;
      const userSnap = await admin.firestore().collection("users").doc(uid).get();
      const user = userSnap.data() as CinemarcUser;
      if (user.rank !== "admin") {
        if (throwUnauthorized) throw error(403, { message: "Unauthorized " });
        return false;
      }
    }
    return true;
  } catch (e) {
    if (throwUnauthorized) throw error(403, { message: "Unauthorized " });
    return false;
  }
}

/// type: import('@sveltejs/kit').Handle
export const first: Handle = async  ({ event, resolve }) => {
  switch (event.url.pathname) {
    case "/api/search-movie-tmdb": {
      await checkAuthentication(event);
      break;
    }
    case "/api/send-user-invitation": {
      await checkAuthentication(event, { rank: "admin" });
      break;
    }
    case "/api/upload-poster-thumbnail": {
      await checkAuthentication(event);
      break;
    }
  }
  return resolve(event);
}
export const handle = sequence(first);