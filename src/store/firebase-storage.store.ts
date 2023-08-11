import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { get, writable } from 'svelte/store';
import { getCurrentApp } from './firebase.store';

const storage$ = writable<FirebaseStorage | undefined>();

export function storage(): FirebaseStorage {
  const app = getCurrentApp();
  if (!app) throw "No Firebase app";

  let st = get(storage$);
  if (!st) {
    st = getStorage(app);
    storage$.set(st);
  }

  return st;
}