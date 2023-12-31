import type { PieceFilterConsumptionStatus, PieceSource, PieceType } from "../models/piece.model";

export const pieceTypeDict: Record<PieceType, string> = {
  book: "Book",
  documentary: "Documentary",
  movie: "Movie",
  music: "Music",
  podcast: "Podcast",
  series: "Series",
  video: "Video",
}

export const pieceTypes: PieceType[] = [
  "movie",
  "series",
  "podcast",
  "documentary",
  "video",
  "book",
  "music",
];

export const pieceSourceDict: Record<PieceSource, string> = {
  downloaded: "Downloaded",
  hbo_max: "HBO Max",
  mubi: "Mubi",
  netflix: "Netflix",
  physical: "Physical",
  prime_video: "Prime Video",
  spotify: "Spotify",
  theater: "Theaters",
  torrent_file: "Torrent file",
  unknown: "Unknown",
  web: "Web",
  youtube: "YouTube",
};

export const pieceSources: PieceSource[] = [
  "netflix",
  "youtube",
  "spotify",
  "torrent_file",
  "downloaded",
  "hbo_max",
  "mubi",
  "prime_video",
  "theater",
  "web",
  "physical",
  "unknown",
];

export const piecePlaceholderImagesURLs: Record<PieceType, string> = {
  book: "https://firebasestorage.googleapis.com/v0/b/cinemarc-edfda.appspot.com/o/placeholders%2Fbook-placeholder-min.jpg?alt=media&token=dc7bd94b-32a9-4a7e-955f-c142ab492018",
  documentary: "https://firebasestorage.googleapis.com/v0/b/cinemarc-edfda.appspot.com/o/placeholders%2Fdocumentary-placeholder-min.jpg?alt=media&token=820d5ba9-b0df-48fc-9666-cf69a29baf13tary",
  movie: "https://firebasestorage.googleapis.com/v0/b/cinemarc-edfda.appspot.com/o/placeholders%2Fmovie-placeholder-min.jpg?alt=media&token=70dc9249-d5c5-4e8d-8fb4-f43629e69e6a",
  music: "https://firebasestorage.googleapis.com/v0/b/cinemarc-edfda.appspot.com/o/placeholders%2Fmusic-placeholder-min.jpg?alt=media&token=ff06ba60-d35f-4800-8dd0-06a3e20b15df",
  podcast: "https://firebasestorage.googleapis.com/v0/b/cinemarc-edfda.appspot.com/o/placeholders%2Fpodcast-placeholder-min.jpg?alt=media&token=41732b2b-75d0-4e3e-a26d-4fe07c44347b",
  series: "https://firebasestorage.googleapis.com/v0/b/cinemarc-edfda.appspot.com/o/placeholders%2Fseries-placeholder-min.jpg?alt=media&token=75d38143-250c-416e-b144-2505c7040645",
  video: "https://firebasestorage.googleapis.com/v0/b/cinemarc-edfda.appspot.com/o/placeholders%2Fvideo-placeholder-min.jpg?alt=media&token=c5dbefe6-c266-47d1-8558-7cca228235f3",
};

export const badgeClassByPieceSource: Record<PieceSource, string> = {
  downloaded: "variant-filled",
  hbo_max: "cinemarc-badge hbo_max",
  netflix: "cinemarc-badge netflix",
  physical: "variant-filled-secondary",
  prime_video: "cinemarc-badge prime_video",
  theater: "cinemarc-badge theater",
  torrent_file: "variant-filled-warning",
  youtube: "cinemarc-badge youtube",
  unknown: "variant-soft-surface",
  spotify: "cinemarc-badge spotify",
  web: "variant-filled-tertiary",
  mubi: "cinemarc-badge mubi",
};

export const consumptionStatusDict: Record<PieceFilterConsumptionStatus, string> = {
  "not-consumed": "Not consumed",
  "all": "Any",
  consumed: "Consumed",
};
