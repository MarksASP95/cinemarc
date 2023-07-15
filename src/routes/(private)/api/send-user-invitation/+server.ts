import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createInvitation } from '../../../../server/controllers/auth.controller';
import type { CinemarcUserRank } from '../../../../models/user.model';

export const POST = (async (event) => {
  const { email, rank } = await event.request.json();

  if (typeof email !== "string") {
    throw error(400, { message: "Email must be a string" });
  }
  if (!email) {
    throw error(400, { message: "Email is required" });
  }
  if (!rank) {
    throw error(400, { message: "Rank is required" });
  }
  try {
    (rank as any) satisfies CinemarcUserRank;
  } catch (e) {
    throw error(400, { message: "Rank value is not valid" });
  }

  try {
    const response = await createInvitation(email, rank)
    if (response.status === 200) {
      return json({ status: 200, data: response.data });
    } else {
      console.log("Error", response)
      return json({ status: response.status })
    }
  } catch (error) {
    return json({ status: 500, message: "Error sending user invitation" });
  }

}) satisfies RequestHandler;