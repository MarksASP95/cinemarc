import type { FirestoreDocument } from "./firestore.model";
import type { Nullable } from "./general.model";

export type PieceType = "movie" | "series" | "podcast" | "documentary" | "video" | "book" | "music";

export type PieceSource = "netflix" | "youtube" | "spotify" | "torrent_file" | "downloaded" | "hbo_max" | 
                          "prime_video" | "mubi" | "theater" | "physical" | "web" | "unknown";

export interface PieceCreate {
  name: string;
  description: Nullable<string>;
  type: PieceType;
  source: PieceSource;
  imageUrl: Nullable<string>;
  releaseDate: Nullable<string>;
  tmdbId: number | null;
}

export interface Piece extends PieceCreate, FirestoreDocument {
  consumed: boolean;
  smallImgUrl: Nullable<string>;

  // TODO: deberia ponerse en el servidor con un trigger
  ownerId: string;
}

export type PieceEditable = Partial<Pick<Piece, 
  "consumed" | 
  "deletedAt" | 
  "description" | 
  "imageUrl" | 
  "isDeleted" | 
  "name" | 
  "source" | 
  "type" |
  "tmdbId"
>>;

type PieceFixedValueFilterKeys = Pick<Piece, "consumed" | "isDeleted" | "source" | "type">;
export type PieceFixedValueFilter = {
  [P in keyof Partial<PieceFixedValueFilterKeys>]: Piece[P] | undefined;
}