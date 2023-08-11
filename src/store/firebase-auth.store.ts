import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";
import { get, writable } from "svelte/store";
import { getCurrentApp } from "./firebase.store";

const auth$ = writable<Auth | undefined>();

export function auth(): Auth {
  const app = getCurrentApp();
  if (!app) throw "No Firebase app";
  
  let auth = get(auth$);
  if (!auth) {
    auth = getAuth(app);
    (async () => {
      await setPersistence(auth, browserLocalPersistence);
    })();

    auth$.set(auth);
    return auth;
  }
  return auth;
}