import type { PieceType } from "../models/piece.model";

export const pieceTypeDict: Record<PieceType, string> = {
  book: "Book",
  documentary: "Documentary",
  movie: "Movie",
  music: "Music",
  podcast: "Podcast",
  series: "Series",
  video: "Video",
}