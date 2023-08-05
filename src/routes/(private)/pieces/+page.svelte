<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import PieceCard from "../../../client/components/PieceCard.svelte";
  import Spinner from "../../../client/components/Spinner.svelte";
  import { deletePiece, getPieces, updatePiece } from "../../../client/pieces/piece.fire";
  import type { Piece } from "../../../models/piece.model";
  import { authUser$ } from "../../../auth/auth.store";
  import { get } from "svelte/store";
  import { modalStore, type ModalComponent, type ModalSettings, type ToastSettings, toastStore, type PopupSettings } from "@skeletonlabs/skeleton";
  import PieceForm from "../PieceForm.svelte";
  import type { CinemarcUser } from "../../../models/user.model";
  import { signOut } from "../../../client/firebase/auth.fire";
  import { goto } from "$app/navigation";

  let authUser: CinemarcUser | undefined;
  let searchStr = ""
  let searchInputEl: HTMLInputElement;

  let pieces: Piece[] | null = null;
  $: displayedPieces = filterPiecesBySearch(searchStr, pieces);

  let undoDeleteFn: Function | null = null;

  function filterPiecesBySearch(_searchStr: string, pieces: Piece[] | null): Piece[] | null {
    if (!pieces) return null;
    if (!searchStr) return pieces;
    return pieces.filter((piece) => piece.name.toLocaleLowerCase().includes(_searchStr));
  }

  onMount(() => {
    authUser$.subscribe((user) => {
      if (user === null) return goto("/login");
      authUser = user;
    });

    modalStore.subscribe((modals) => {
      if (modals.length) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "initial";
      }
    })
  })

  const pieces$ = getPieces((ps) => {
    pieces = ps;
  });

  onDestroy(() => {
    pieces$();
  });

  function handleSearchSubmit(e: any) {
    if (e.key !== "Enter") return;
    searchStr = (e.target.value as string).toLowerCase();
  }

  function clearSearch() {
    searchStr = "";
    searchInputEl.value = "";
  }

  function handleFormUpdateSuccess() {
    modalStore.close();
    const t: ToastSettings = {
      message: 'Piece updated! 🎉',
      background: 'variant-filled-success',
    };
    toastStore.trigger(t);
  }

  function openEditModal(e: CustomEvent<Piece>) {
    const { detail: piece } = e;

    const formModalComponent: ModalComponent = {
      ref: PieceForm,
      props: {
        success: handleFormUpdateSuccess,
        pieceToEdit: piece,
        close: onCloseModalClick,
      },
    }
    const formModal: ModalSettings = {
      type: "component",
      component: formModalComponent,
    }
    modalStore.trigger(formModal);
  }
  
  function handleSignOutClick() {
    signOut();
  }

  function handleFormCreateSuccess() {
    modalStore.close();
    const t: ToastSettings = {
      message: 'Piece created! 🎉',
      background: 'variant-filled-success',
    };
    toastStore.trigger(t);
  }
  function onCloseModalClick() {
    modalStore.close();
  }

  function handlePlusButtonClick() {
    const formModalComponent: ModalComponent = {
      ref: PieceForm,
      props: {
        success: handleFormCreateSuccess,
        close: onCloseModalClick,
      },
    }
    const formModal: ModalSettings = {
      type: "component",
      component: formModalComponent,
    }
    modalStore.trigger(formModal);
  }

  function undoDelete(pieceId: string) {
    updatePiece(pieceId, { isDeleted: false, deletedAt: null });
    undoDeleteFn = null;
  }

  function handlePieceDeleted(e: CustomEvent<string>) {
    const { detail: pieceId } = e;
    // @ts-ignore
    undoDeleteFn = undoDelete.bind(this, pieceId);
    setTimeout(() => {
      if (!!undoDeleteFn) undoDeleteFn = null;
    }, 4000);
  }
</script>

<style lang="scss">
  header.cinemarc-header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .cinemarc-home {
      font-family: "Sono";
    }
  }
  .clear-search-button {
    max-width: 200px;
  }
  .piece-card {
    &__header {

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
  .undo-delete-popup {
    position: fixed;
    top: -50px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 9999;
    transition: top 200ms cubic-bezier(.31,.94,1,.99);

    &.show {
      top: 30px;
    }
  }
</style>

<section class="pieces-page">
  <div class:show={!!undoDeleteFn} class="undo-delete-popup btn btn-sm bg-gradient-to-br variant-gradient-primary-tertiary">
    Piece deleted &nbsp; <button on:click={() => undoDeleteFn ? undoDeleteFn() : null} type="button" class="btn btn-sm variant-ghost-success">undo</button>
  </div>
  <header class="cinemarc-header">
    <h1 class="text-center cinemarc-home">
      cinemarc <span class="font-mono">({ authUser?.username || authUser?.email || '' })</span>
    </h1>
    <button on:click={handleSignOutClick} type="button" class="btn btn-sm bg-gradient-to-br variant-gradient-error-success">
      <span>sign out</span>
      <span>👋</span>
    </button>
  </header>
  
  <div class="search-bar mb-8">
    <!-- svelte-ignore a11y-positive-tabindex -->
    <input 
      bind:this={searchInputEl}
      on:keyup={handleSearchSubmit}
      autocomplete="off" 
      autocapitalize="none"
      id="piece-search-input" 
      tabindex="1" 
      class="input" 
      type="text" 
      placeholder="Search for a movie, series, podcast, or anything" 
    />
  </div>
  
  {#if !!displayedPieces && !!searchStr}
    <div class="flex justify-center mb-4">
      <button on:click={clearSearch} type="button" class="btn w-full max-w-xs btn-sm variant-filled clear-search-button">
        Clear search
      </button>
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    {#if !!displayedPieces}
      {#each displayedPieces as piece, index (piece.id)}
        <PieceCard on:pieceDeleted={handlePieceDeleted} on:editButtonClick={openEditModal} {piece} {index} />
      {/each}
  
      <button on:click={handlePlusButtonClick} type="button" class="btn-icon btn-icon-xl variant-filled fixed bottom-6 right-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="#000" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg>
      </button>
    {:else}
      {#each [0, 0, 0, 0, 0, 0, 0, 0] as _}
      <div class="card bg-initial relative piece-card cursor-pointer animate-pulse">
        <header class="relative piece-card__header">
          <div class="placeholder w-full" style="height: 200px;"></div>
        </header>
        <div class="p-4">
          <div class="flex justify-between">
            <div class="placeholder mb-2" style="width: 80px;"></div>
            <div class="placeholder mb-2" style="width: 100px;"></div>
          </div>
          <div class="placeholder mb-2" style="height: 30px;"></div>
          <div class="placeholder" style="height: 100px;"></div>
        </div>
      </div>
      {/each}
    {/if}
  </div>
</section>