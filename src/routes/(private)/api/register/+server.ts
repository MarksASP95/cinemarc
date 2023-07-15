import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAuthUserWithInvitation, createInvitation } from '../../../../server/controllers/auth.controller';
import type { CinemarcUserRank } from '../../../../models/user.model';

export const POST = (async (event) => {
  const { userId, password, username, avatarUrl } = await event.request.json();

  if (typeof userId !== "string") {
    throw error(400, { message: "User ID must be a string" });
  }
  if (!userId) {
    throw error(400, { message: "User ID is required" });
  }
  if (typeof username !== "string") {
    throw error(400, { message: "Username must be a string" });
  }
  if (!username) {
    throw error(400, { message: "Username is required" });
  }
  if (username.length > 30 || username.length < 6) {
    throw error(400, { message: "Username must have between 6 and 30 characters" });
  }
  if (typeof password !== "string") {
    throw error(400, { message: "Password must be a string" });
  }
  if (!password) {
    throw error(400, { message: "Password is required" });
  }
  if (password.length > 100 || password.length < 6) {
    throw error(400, { message: "Password must have between 6 and 100 characters" });
  }

  try {
    const response = await createAuthUserWithInvitation(userId, password, username, avatarUrl);
    if (response.status === 200) {
      return json({ status: 200, data: response.data });
    } else {
      console.log("Error", response)
      throw error(500, { message: "An error has ocurred" });
    }
  } catch (e) {
    console.log(e);
    throw error(500, { message: "An error has ocurred" });
  }

}) satisfies RequestHandler;