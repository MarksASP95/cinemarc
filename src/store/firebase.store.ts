import { type FirebaseApp, initializeApp, type FirebaseOptions } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { writable, get } from 'svelte/store';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from '../client/firebase/config.fire';

const firebaseApp$ = writable<FirebaseApp | undefined>();
const auth$ = writable<Auth | undefined>();
const fs$ = writable<Firestore | undefined>();
const storage$ = writable<FirebaseStorage | undefined>();

function initFirebase(config: FirebaseOptions): FirebaseApp {
  const currentApp = getCurrentApp();
  if (currentApp) return currentApp;

  const app = initializeApp(config);
  firebaseApp$.set(app);
  return app;
}
initFirebase(firebaseConfig);

function getCurrentApp(): FirebaseApp | undefined {
  return get(firebaseApp$);
}

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