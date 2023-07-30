// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEBowmLBYAX6i9H9hZf5Tlo5z2czrhNOg",
  authDomain: "cinemarc-edfda.firebaseapp.com",
  projectId: "cinemarc-edfda",
  storageBucket: "cinemarc-edfda.appspot.com",
  messagingSenderId: "1091144875838",
  appId: "1:1091144875838:web:ca1ac1698206c09119366f"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
(async () => {
  await setPersistence(auth, browserLocalPersistence);
})();

export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);