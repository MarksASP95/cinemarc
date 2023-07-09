import type { Nullable } from "./general.model";
import type { RichTimestamp } from "./timestamp.model";

export interface FirestoreDocument {
  id: string;
  createdAt: RichTimestamp;
  isDeleted: boolean;
  deletedAt: Nullable<RichTimestamp>;
}