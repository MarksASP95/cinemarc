import { goto } from "$app/navigation";
import { drawerStore } from "@skeletonlabs/skeleton";
import { collection, doc, getDoc } from "firebase/firestore";
import { get } from "svelte/store";
import { authUser$, jwtToken$ } from "../../auth/auth.store";
import type { CinemarcUser } from "../../models/user.model";
import { auth } from "../../store/firebase-auth.store";
import { firestore } from "../../store/firebase-firestore.store";

const PUBLIC_ROUTES = [
  "login",
  "register",
];

export function signOut() {
  auth().signOut();
  drawerStore.close();
  authUser$.set(null);
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
      const locationName = window.location.pathname.split("/")[1];
      const routeIsPublic = !!PUBLIC_ROUTES.find((route) => route.includes(locationName));
      if (!authState) {
        if (get(authUser$) || !routeIsPublic) {
          goto("/login", { replaceState: true });
        }
        authUser$.set(null);
        jwtToken$.set(null);
        return;
      }

      if (routeIsPublic) goto("/pieces", { replaceState: true });

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

export function getAuthorizationHeader(): object {
  if (!get(jwtToken$)) return {};
  return {
    "Authorization": `Bearer ${get(jwtToken$)}`,
  };
}