import type admin from "firebase-admin";
import type { FirestoreTimestamp } from "../models/timestamp.model";

export function snapData<T>(snap: admin.firestore.QuerySnapshot<T>): T[] {
  return snap.docs.map((doc) => doc.data() as T);
}

export function toSerializable<T>(data: any): T {
  if (data.createdAt) data.createdAt = timestampToDate(data.createdAt);
  if (data.deletedAt) data.deletedAt = timestampToDate(data.deletedAt);
  
  return data;
}

export function timestampToDate(value: any): Date | null {
  if (!value) return null;

  if ((value as FirestoreTimestamp).toDate) {
    return (value as FirestoreTimestamp).toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}