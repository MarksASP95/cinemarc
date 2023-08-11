import { browserLocalPersistence, getAuth, initializeAuth, setPersistence, type Auth } from "firebase/auth";
import { get, writable } from "svelte/store";
import { getCurrentApp } from "./firebase.store";

const auth$ = writable<Auth | undefined>();

export function auth(): Auth {
  const app = getCurrentApp();
  if (!app) throw "No Firebase app";
  
  let auth = get(auth$);
  if (!auth) {
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });

    auth$.set(auth);
    return auth;
  }
  return auth;
}