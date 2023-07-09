import type admin from "firebase-admin";
import type { DocumentData, Query } from "firebase/firestore";
import type { Paged } from "../models/general.model";
import type { FirestoreTimestamp } from "../models/timestamp.model";

export function paginateQuery<T>(
  query: admin.firestore.Query, 
  page: number, 
  pageSize: number
): Promise<Paged<T>> {
  const queryPr = query
    .offset(pageSize * (page - 1))
    .limit(pageSize)
    .get()
    .then((snap) => toSerializableArray<T>(snapData<T>(snap as any)));
  const countPr = query.count().get().then((value) => value.data().count);

  return Promise.all([
    queryPr,
    countPr,
  ])
    .then(([queryValue, countValue]) => {
      return {
        data: queryValue,
        page,
        total: countValue,
      }
    });
}

export function snapData<T>(snap: admin.firestore.QuerySnapshot<T>): T[] {
  return snap.docs.map((doc) => doc.data() as T);
}

export function toSerializableArray<T>(data: any[]): T[] {
  return data.map(toSerializable<T>);
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