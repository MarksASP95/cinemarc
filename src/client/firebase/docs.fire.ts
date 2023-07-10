import type { DocumentData, QuerySnapshot } from "firebase/firestore";

export function snapData<T>(snap: QuerySnapshot<DocumentData, DocumentData>): T[] {
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