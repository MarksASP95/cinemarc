import { goto } from "$app/navigation";
import { collection, doc, getDoc } from "firebase/firestore";
import { authUser$ } from "../../auth/auth.store";
import type { CinemarcUser } from "../../models/user.model";
import { auth, firestore } from "./config.fire";

// function fetchCurrentUser(uid: string): Promise<CinemarcUser> {
//   const usersCol = collection(firestore, "users");
//   doc
// }

export function listenToAuthChanges() {
  auth.onAuthStateChanged(
    (authState) => {
      if (!authState) {
        authUser$.set(null);
        goto("/login");
        return;
      }


    }
  );
}