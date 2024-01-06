<script lang="ts">
  import type { Piece, PieceSource, PieceType } from "../../models/piece.model";
  import { badgeClassByPieceSource, pieceSourceDict, pieceTypeDict } from "../../constants/piece.const";
  import { popup, toastStore, type PopupSettings } from "@skeletonlabs/skeleton";
  import { deletePiece, setConsumedValue, updatePiece } from "../pieces/piece.fire";
  import { createEventDispatcher } from "svelte";
  import { minimizeDate } from "../../utils/time.utils";
  import Spinner from "./Spinner.svelte";

  export let piece: Piece;
  export let index: number;

  const today = minimizeDate(new Date());
  const pieceToBeReleased = piece.releaseDate ? 
    minimizeDate(new Date(piece.releaseDate)).getTime() > today.getTime() 
    : 
    false;
  const pieceReleasesToday = piece.releaseDate ? 
    minimizeDate(new Date(piece.releaseDate)).getTime() === today.getTime() 
    : 
    false;
  const dispatch = createEventDispatcher<{ 
    editButtonClick: Piece, 
    pieceDeletedToggle: { pieceId: string, isDeleted: boolean; },
    pieceConsumedToggle: { pieceId: string, consumed: boolean; },
  }>();

  let settingSource = false;

  let sourceOptions
  : { suggested: PieceSource[], other: PieceSource[] }
  = {
    suggested: [],
    other: [],
  }

  $: {
    switch (piece.source) {
      case "unknown": {
        sourceOptions = {
          suggested: ["torrent_file", "downloaded", "netflix", "prime_video", "mubi"],
          other: ["hbo_max", "physical", "spotify", "theater", "web", "youtube"],
        }
        break
      }
      case "torrent_file": {
        sourceOptions = {
          suggested: ["downloaded"],
          other: [],
        }
        break
      }
      default: {
        sourceOptions = { suggested: [], other: [], };
      }
    }
  }

  function handleEditButtonClick() {
    dispatch("editButtonClick", piece);
  }

  const FALLBACK_IMAGE_URL = "https://i.blogs.es/e652ca/harold-pain-meme/840_560.jpeg";
  
  const settingConsumedStateDict: Record<string, boolean> = {};

  const consumedStateTextyPieceType: Record<PieceType, [string, string]> = {
    book: ["Read", "Not read"],
    documentary: ["Watched", "Not watched"],
    movie: ["Watched", "Not watched"],
    music: ["Listened", "Not listened"],
    podcast: ["Listened", "Not listened"],
    series: ["Watched", "Not watched"],
    video: ["Watched", "Not watched"],
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
    setConsumedValue(pieceId, newState)
      .then(() => dispatch("pieceConsumedToggle", { pieceId, consumed: newState }))
      .finally(() => settingConsumedStateDict[pieceId] = false);
  }

  function handleDeleteButtonClick() {
    deletePiece(piece.id)
      .then(() => {
        dispatch("pieceDeletedToggle", { pieceId: piece.id, isDeleted: true });
      });
  }

  function handleRestoreButtonClick() {
    updatePiece(piece.id, { isDeleted: false, deletedAt: null })
      .then(() => {
        dispatch("pieceDeletedToggle", { pieceId: piece.id, isDeleted: false });
      });
  }

  function setSource(source: PieceSource) {
    settingSource = true;
    updatePiece(piece.id, { source })
      .then(() => {
        toastStore.trigger({
          message: "Status set",
          background: 'variant-filled-success',
        });
      })
      .catch((err) => {
        console.log(err)
        toastStore.trigger({
          message: "An error ocurred",
          background: 'variant-filled-error',
        });
      })
      .finally(() => settingSource = false)
  }

  function formatReleaseDate(dateStr: string) {
    const dateTimeOffset = new Date().getTimezoneOffset();
    const date = new Date(dateStr);
    date.setMinutes(date.getMinutes() + dateTimeOffset);
    return new Intl.DateTimeFormat(
      "GB", 
      { 
        day: "numeric", 
        month: "long", 
        year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" 
      })
      .format(date);
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

  .popup-positioning {
    left: 50% !important; 
    top: 10px !important; 
    transform: translate(-50%, 0) !important;
  }

  .status-scroll {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
    &::-webkit-scrollbar {
      display: none;
    }
  }
</style>

<div on:dblclick={handleDoubleClick} role="button" tabindex={index + 2} use:popup={piecePopup} class="card bg-initial relative piece-card cursor-pointer">
  <div data-popup={piece.id} class="popup-container popup-positioning z-10">
    <div class="card p-4 w-72 bg-gradient-to-br variant-gradient-success-warning shadow-xl mb-2">
      <!-- <div class="arrow bg-surface-100-800-token" /> -->
      <p class="h4 mb-4 font-medium">{piece.name}</p>
      <div class="grid grid-cols-2 gap-2">
        <button 
          type="button" 
          class:variant-filled-tertiary={!piece.consumed} 
          class:variant-filled-error={piece.consumed}
          class="btn btn-sm variant-filled col-span-2"
          on:click={() => setPieceConsumedState(piece.id, !piece.consumed)}
          disabled={settingConsumedStateDict[piece.id]}
        >
          <div class="flex flex-col items-center">
            <p>
              {#if piece.consumed}
                👈
              {:else}
                ✅
              {/if}
            </p>
            <p>
              { consumedStateTextyPieceType[piece.type][+piece.consumed] } &nbsp;
            </p>
          </div>
        </button>
  
        <button on:click={handleEditButtonClick} type="button" class="btn variant-filled-secondary btn-sm">
          <div class="flex flex-col items-center">
            <p>✏️</p>
            <p>Edit</p>
          </div>
        </button>
  
        {#if piece.isDeleted}
        <button on:click={handleRestoreButtonClick} type="button" class="btn variant-filled-success btn-sm">
          <div class="flex flex-col items-center">
            <p>↩️</p>
            <p>Restore</p>
          </div>
        </button>
        {:else}
          <button on:click={handleDeleteButtonClick} type="button" class="btn variant-filled-error btn-sm">
            <div class="flex flex-col items-center">
              <p>🗑️</p>
              <p>Delete</p>
            </div>
          </button>
        {/if}
      </div>
    </div>
    {#if sourceOptions.suggested.length || sourceOptions.other.length}
      <div class="card p-4 w-72 bg-gradient-to-br variant-gradient-success-warning shadow-xl">
        <p class="text-sm mb-1">
          Set status
        </p>
        {#if settingSource}
          <div class="flex justify-center items-center">
            <Spinner />
          </div>
        {:else}
          <div class="flex items-center overflow-auto pb-2 status-scroll">
            {#if sourceOptions.suggested.length}
              {#each sourceOptions.suggested as option}
                <div on:click={() => setSource(option)} class={`mr-2 badge ${badgeClassByPieceSource[option]}`}>
                  {pieceSourceDict[option].toLowerCase()}
                </div>
              {/each}
              {#if sourceOptions.other.length}
                <p class="mr-2">|</p>
              {/if}
            {/if}

            {#if sourceOptions.other.length}
              {#each sourceOptions.other as option}
                <div on:click={() => setSource(option)} class={`mr-2 badge ${badgeClassByPieceSource[option]}`}>
                  {pieceSourceDict[option].toLowerCase()}
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/if}
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
    {#if piece.consumed}
      <span class="absolute top-4 left-4">
        ✅
      </span>
    {/if}
  </header>
  <div class="p-4">
    <div class="flex justify-between">
      <div class={`badge ${badgeClassByPieceSource[piece.source]}`}>
        {pieceSourceDict[piece.source].toLowerCase()}
      </div>
      <div 
        class="badge"
        class:variant-soft-warning={pieceToBeReleased}
        class:bg-gradient-to-br={pieceReleasesToday}
        class:variant-gradient-warning-success={pieceReleasesToday}
      >
        {piece.releaseDate ? formatReleaseDate(piece.releaseDate) : ""}
      </div>
    </div>
    <h3 class="h3">
      { piece.name }
    </h3>
    {#if piece.type === "book" && !!piece.author}
      <small>{piece.author}</small>
    {/if}
    {#if piece.description}
      <article>
        <p>
          { piece.description }
        </p>
      </article>
    {/if}
  </div>
</div>