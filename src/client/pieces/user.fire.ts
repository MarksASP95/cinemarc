import { collection, query, where, type CollectionReference } from "firebase/firestore";
import type { ValueCallback } from "../../models/general.model";
import type { CinemarcUser } from "../../models/user.model";
import { firestore } from "../../store/firebase-firestore.store";
import { valueCollectionSnap } from "../firebase/docs.fire";

const usersCol = collection(firestore(), "users") as CollectionReference<CinemarcUser>;

export function getUsers(onValue: ValueCallback<CinemarcUser[]>) {
  const q = query(usersCol, where("isDeleted", "==", false));
  return valueCollectionSnap(q, onValue);
}