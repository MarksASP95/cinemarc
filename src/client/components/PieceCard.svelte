<script lang="ts">
  import type { Piece, PieceSource, PieceType } from "../../models/piece.model";
  import { pieceTypeDict } from "../../constants/piece.const";
  import { popup, type PopupSettings } from "@skeletonlabs/skeleton";
  import { updatePiece } from "../pieces/piece.fire";

  export let piece: Piece;
  export let index: number;

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

  const settingConsumedStateDict: Record<string, boolean> = {};

  const consumedStateTextyPieceType: Record<PieceType, [string, string]> = {
    book: ["Mark as read", "Mark as not read"],
    documentary: ["Mark as watched", "Mark as not watched"],
    movie: ["Mark as watched", "Mark as not watched"],
    music: ["Mark as listened", "Mark as not listened"],
    podcast: ["Mark as listened", "Mark as not listened"],
    series: ["Mark as watched", "Mark as not watched"],
    video: ["Mark as watched", "Mark as not watched"],
  };

  const loadedImagesDict: Record<string, boolean> = {};

  function handlePieceImageLoaded(e: Event, id: string) {
    const imgEl = e.target as HTMLImageElement;
    if (imgEl.complete) {
      loadedImagesDict[id] = true;
    }
  }

  const piecePopup: PopupSettings = {
    event: 'click',
    target: piece.id,
    placement: 'right',
  };

  function handleDoubleClick() {
    console.log(piece.id);
  }

  function setPieceConsumedState(pieceId: string, newState: boolean) {
    settingConsumedStateDict[pieceId] = true;
    updatePiece(pieceId, { consumed: newState })
      .finally(() => settingConsumedStateDict[pieceId] = false);
  }
</script>

<style lang="scss">
  .piece-card {
    &__header {
      background-size: cover;
      background-position: center;
      position: relative;

      &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.1);
        filter: blur(7px);
      }

      > img {
        opacity: 0;
        transition: opacity 200ms ease-in-out;
        width: 100%;
        display: block;
      }
      
      &--loaded {
        > img {
          opacity: 1;
        }
      }
    }
  }
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

<div on:dblclick={handleDoubleClick} role="button" tabindex={index + 2} use:popup={piecePopup} class="card bg-initial relative piece-card cursor-pointer">
  <div data-popup={piece.id} class="card p-4 w-72 variant-glass-success shadow-xl z-10">
    <div class="arrow bg-surface-100-800-token" />
    <p class="h4 mb-4">{piece.name}</p>
    <div class="flex justify-center">
      <button 
        type="button" 
        class:variant-filled-tertiary={!piece.consumed} 
        class:variant-filled-error={piece.consumed}
        class="btn btn-sm variant-filled mr-1"
        on:click={() => setPieceConsumedState(piece.id, !piece.consumed)}
        disabled={settingConsumedStateDict[piece.id]}
      >
        { consumedStateTextyPieceType[piece.type][+piece.consumed] } &nbsp;
        {#if piece.consumed}
          👈
        {:else}
          ✅
        {/if}
      </button>

      <button type="button" class="btn variant-filled-secondary btn-sm">
        Edit ✏️
      </button>
    </div>
  </div>
  <header 
    class="relative piece-card__header"
    class:piece-card__header--loaded={loadedImagesDict[piece.id]}
    style="{piece.smallImgUrl ? `background-image: url(${piece.smallImgUrl})` : ""}"
  >
    <img on:load={(e) => handlePieceImageLoaded(e, piece.id)} loading="lazy" src={piece.imageUrl || FALLBACK_IMAGE_URL} class="bg-black/50 w-full aspect-[21/9] object-cover" alt="Post">
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
</div>