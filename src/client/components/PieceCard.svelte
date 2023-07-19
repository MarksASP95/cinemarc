<script lang="ts">
  import type { Piece, PieceSource, PieceType } from "../../models/piece.model";
  import { pieceTypeDict } from "../../constants/piece.const";

  export let piece: Piece;

  const FALLBACK_IMAGE_URL = "https://i.blogs.es/e652ca/harold-pain-meme/840_560.jpeg";

  const badgeClassByPieceSource: Record<PieceSource, string> = {
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
</script>

<style lang="scss">
  .cinemarc-badge {
    &.hbo_max {
      background: rgb(0,0,0);
      background: linear-gradient(50deg, rgba(88,18,93,100) 21%, rgba(31,33,104,20) 71%);
      color: #fff;
    }
    &.netflix {
      background-color: #E50914;
      color: #fff;
    }
    &.prime_video {
      background-color: #00A8E1;
      color: #fff;
    }
    &.theater {
      background-color: #C13929;
      color: #fff;
    }
    &.youtube {
      background-color: #FF0000;
      color: #fff;
    }
    &.spotify {
      background-color: #1DB954;
      color: #191414;
    }
    &.mubi {
      background-color: #123485;
      color: #fff;
    }
  }
</style>

<a href="/" class="card bg-initial card-hover overflow-hidden">
  <header class="relative">
    <img src="{piece.imageUrl || FALLBACK_IMAGE_URL}" class="bg-black/50 w-full aspect-[21/9] object-cover" alt="Post">
    <span class="badge variant-filled absolute top-4 right-4">
      { pieceTypeDict[piece.type].toLowerCase() }
    </span>
  </header>
  <div class="p-4">
    <div class={`badge ${badgeClassByPieceSource[piece.source]}`}>
      {piece.source}
    </div>
    <h3 class="h3">
      { piece.name }
    </h3>
    {#if piece.description}
      <article>
        <p>
          { piece.description }
        </p>
      </article>
    {/if}
  </div>
</a>