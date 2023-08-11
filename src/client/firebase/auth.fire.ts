import { goto } from "$app/navigation";
import { collection, doc, getDoc } from "firebase/firestore";
import { authUser$, jwtToken$ } from "../../auth/auth.store";
import type { CinemarcUser } from "../../models/user.model";
import { auth } from "../../store/firebase-auth.store";
import { firestore } from "../../store/firebase-firestore.store";

export function signOut() {
  auth().signOut();
  location.reload();
}

function fetchCurrentUser(uid: string): Promise<CinemarcUser | null> {
  const fs = firestore()
  const usersCol = collection(fs, "users");
  return getDoc(doc(usersCol, uid))
    .then((userSnap) => {
      if (!userSnap.exists) return null;
      return userSnap.data() as CinemarcUser;
    });
}

export function listenToAuthChanges() {
  auth().onAuthStateChanged(
    (authState) => {
      if (!authState) {
        authUser$.set(null);
        jwtToken$.set(null);
        goto("/login");
        return;
      }

      fetchCurrentUser(authState.uid)
        .then((user) => {
          authUser$.set(user);
        })

      authState.getIdToken()
        .then((token) => {
          jwtToken$.set(token);
        })
        .catch(() => {
          jwtToken$.set(undefined);
        });


    }
  );
}