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