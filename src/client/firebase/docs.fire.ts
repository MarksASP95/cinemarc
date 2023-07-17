import { DocumentReference, onSnapshot, type DocumentData, type Query, type QuerySnapshot, type Unsubscribe } from "firebase/firestore";
import type { ColObserverCompleteCallback, ColSnapshotCallback, ColSnapshotErrorCallback, ValueCallback } from "../../models/general.model";

export function snapData<T>(snap: QuerySnapshot<T, DocumentData>): T[] {
  return snap.docs.map((doc) => doc.data() as T);
}

export function generateId(): string {
      // Alphanumeric characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
}

export function subscribeTo<T = any>(
  q: Query<T>, 
  next: ColSnapshotCallback<T>, 
  error?: ColSnapshotErrorCallback<T>, 
  complete?: ColObserverCompleteCallback
) {
  return onSnapshot(q, { next, error, complete });
}

export function valueCollectionSnap<T = any>(
  q: Query<T>, 
  _next: ValueCallback<T[]>,
): Unsubscribe {
  return onSnapshot(q, {
    next: (snap) => {
      const data = snapData(snap);
      _next(data);
    }
  })
}

export function valueDocSnap<T = any>(
  q: DocumentReference<T>, 
  _next: ValueCallback<T | undefined>,
): Unsubscribe {
  return onSnapshot(q, {
    next: (snap) => {
      const data = snap.data();
      _next(data);
    }
  })
}