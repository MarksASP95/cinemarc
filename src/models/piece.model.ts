import type { FirestoreDocument } from "./firestore.model";
import type { Nullable } from "./general.model";

export type PieceType = "movie" | "series" | "podcast" | "documentary" | "video";

export type PieceSource = "netflix" | "youtube" | "torrent_file" | "downloaded" | "hbo_max" | 
                          "prime_video" | "theater";

export interface PieceCreate {
  name: string;
  description: Nullable<string>;
  type: PieceType;
  source: PieceSource;
  imageUrl: Nullable<string>;
}

export interface Piece extends PieceCreate, FirestoreDocument {
  consumed: boolean;
}

export type PieceEditable = Partial<Pick<Piece, 
  "consumed" | 
  "deletedAt" | 
  "description" | 
  "imageUrl" | 
  "isDeleted" | 
  "name" | 
  "source" | 
  "type"
>>;