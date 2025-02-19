import { FirestoreDocument } from "./firestore.model";

export interface Tag {
  text: string;
  class: string;
}

export interface TagDocument extends Tag, FirestoreDocument {}
