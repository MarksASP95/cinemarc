import { browser } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';
import { authUser$ } from '../../../../../auth/auth.store.js';
import { listenToAuthChanges } from '../../../../../client/firebase/auth.fire.js';
 
/** @type {import('./$types').PageLoad} */
export async function load() {
  if (browser) {
    listenToAuthChanges();
    const allowed = await new Promise((resolve, reject) => {
      authUser$.subscribe((user) => {
        if (user === null) return resolve(false)
        if (!user) return;
        if (user.rank === "admin") return resolve(true);
        
        resolve(false);
      });
    });
    if (!allowed) throw redirect(308, "/pieces");
  }
  return {};
}