import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAuthUserWithInvitation, createInvitation } from '../../../../server/controllers/auth.controller';
import type { CinemarcUserRank } from '../../../../models/user.model';
import { checkPassword, checkUsername } from '../../../../constants/user.const';

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
  if (typeof password !== "string") {
    throw error(400, { message: "Password must be a string" });
  }
  if (!password) {
    throw error(400, { message: "Password is required" });
  }

  const usernameError = checkUsername(username);
  if (usernameError) {
    throw error(400, { message: usernameError });
  }

  const passwordError = checkPassword(password);
  if (passwordError) {
    throw error(400, { message: passwordError });
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