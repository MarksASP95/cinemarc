import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createInvitation } from '../../../../server/controllers/auth.controller';
import type { CinemarcUserRank } from '../../../../models/user.model';
import type { CinemarcResponse } from '../../../../models/api.model';

export const POST = (async (event) => {
  const { email } = await event.request.json();

  if (typeof email !== "string") {
    throw error(400, { message: "Email must be a string" });
  }
  if (!email) {
    throw error(400, { message: "Email is required" });
  }

  let response: CinemarcResponse<any>;
  try {
    response = await createInvitation(email)
  } catch (error) {}

  if (response!.status === 200) {
    return json({ status: 200, data: response!.data });
  } else {
    console.log("Error", response!)
    throw error(response!.status, { message: response!.message || "" })
  }

}) satisfies RequestHandler;