import type { DocumentData, DocumentReference, FirestoreError, QuerySnapshot } from "firebase/firestore";

export type Nullable<T> = T | null;

export interface ServerTimeDoc<T> {
  time: T;
}

export interface FileUploadOutputMetadata {
  bucket: string;
  contentType: string;
  fileOriginalName: string;
  fullPath: string;
  name: string;
  size: number;
  timeCreated: string;
  type: string;
  updated: string;
}

export interface FileUploadOutput {
  url: string;
  metadata: FileUploadOutputMetadata;
}

export interface FileUploaderSuccessOutput {
  newUploads: FileUploadOutput[];
  allUploads: FileUploadOutput[];
}

export interface Paged<T> {
  data: T[];
  page: number;
  total: number;
}

export type ColSnapshotCallback<T> = (snapshot: QuerySnapshot<T, DocumentData>) => void;
export type ColSnapshotErrorCallback<T> = (error: FirestoreError) => void;
export type ColObserverCompleteCallback = () => void;

export interface ColObserver<T> {
  next?: ColSnapshotCallback<T>;
  error?: ColSnapshotErrorCallback<T>;
  complete?: ColObserverCompleteCallback;
}

export type DocSnapshotCallback<T> = (snapshot: DocumentReference<T, DocumentData>) => void;
export type DocSnapshotErrorCallback<T> = (error: FirestoreError) => void;
export type DocObserverCompleteCallback = () => void;

export interface DocObserver<T> {
  next?: DocSnapshotCallback<T>;
  error?: DocSnapshotErrorCallback<T>;
  complete?: DocObserverCompleteCallback;
}

export type ValueCallback<T> = (data: T) => void;