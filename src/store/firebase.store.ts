import { type FirebaseApp, initializeApp, type FirebaseOptions } from "firebase/app";
import { writable, get } from 'svelte/store';
import { firebaseConfig } from '../client/firebase/config.fire';

const firebaseApp$ = writable<FirebaseApp | undefined>();

function initFirebase(config: FirebaseOptions): FirebaseApp {
  const currentApp = getCurrentApp();
  if (currentApp) return currentApp;

  const app = initializeApp(config);
  firebaseApp$.set(app);
  return app;
}
initFirebase(firebaseConfig);

export function getCurrentApp(): FirebaseApp | undefined {
  return get(firebaseApp$);
}