import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
  console.log(event.request.headers.get("cookie"))
  return {
    test: "test"
  }
}