import type { FirestoreDocument } from "./firestore.model";

export interface CinemarcUserCreate {
  username: string;
  email: string;
  avatarUrl: string;
}

export interface CinemarcUser extends CinemarcUserCreate, FirestoreDocument {
  isActive: boolean;
}

export interface AuthUser {
  uid: string;
  email: string;
}