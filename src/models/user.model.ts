import type { FirestoreDocument } from "./firestore.model";

export interface CinemarcUserCreate {
  username: string;
  email: string;
  avatarUrl: string | null;
  rank: CinemarcUserRank;
}

export type CinermarcUserAuthStatus = "invited" | "complete";
export type CinemarcUserRank = "user" | "admin";

export interface CinemarcUser extends CinemarcUserCreate, FirestoreDocument {
  isActive: boolean;
  authStatus: CinermarcUserAuthStatus;
}

export interface AuthUser {
  uid: string;
  email: string;
}

export type SignInResult 
  = "wrong_credentials" | "user_not_active" | 
    "server_could_not_respond" | "user_does_not_exist" | 
    "success";