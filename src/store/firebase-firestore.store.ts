import { Firestore, getFirestore } from "firebase/firestore";
import { get, writable } from "svelte/store";
import { getCurrentApp } from "./firebase.store";

const fs$ = writable<Firestore | undefined>();

export function firestore(): Firestore {
  const app = getCurrentApp();
  if (!app) throw "No Firebase app";

  let fs = get(fs$);
  if (!fs) {
    fs = getFirestore(app);
    fs$.set(fs);
  }

  return fs;
}