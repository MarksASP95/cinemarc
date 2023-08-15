import { config } from 'dotenv';
import admin from "firebase-admin";
import { readFileSync } from "fs";

config();

(() => {
  if (process.env.ENVIRONMENT !== "prod") return;
  
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  
  const packageJsonRaw = readFileSync('./package.json', 'utf8');
  const { version } = JSON.parse(packageJsonRaw);
  
  if (version) {
    admin.firestore().collection("variables").doc("version").set({
      value: version,
    });
  }
})();