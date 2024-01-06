<script lang="ts">
  import { onMount } from "svelte";
  import PieceCard from "../../../client/components/PieceCard.svelte";
  import { getPieces, setConsumedValue, updatePiece } from "../../../client/pieces/piece.fire";
  import type { Piece, PieceFixedValueFilter } from "../../../models/piece.model";
  import { authUser$ } from "../../../auth/auth.store";
  import { modalStore, type ModalComponent, type ModalSettings, type ToastSettings, toastStore } from "@skeletonlabs/skeleton";
  import PieceForm from "../PieceForm.svelte";
  import type { CinemarcUser } from "../../../models/user.model";
  import { goto } from "$app/navigation";
  import type { Unsubscribe } from "firebase/auth";
  import PieceFiltersForm from "../PieceFiltersForm.svelte";
  import PieceFiltersBadges from "../PieceFiltersBadges.svelte";

  let authUser: CinemarcUser | undefined;
  let searchStr = ""
  let searchInputEl: HTMLInputElement;

  let pieces: Piece[] | null = null;
  $: displayedPieces = filterPiecesBySearch(searchStr, pieces);

  let undoDeleteFn: Function | null = null;
  let undoConsumedFn: Function | null = null;

  let showGoToTopButton = false;
  let fixedFilters = false;
  let yScroll: number;
  $: {
    if (!!yScroll) {
      showGoToTopButton = yScroll >= 200;
      fixedFilters = yScroll >= 200;
    }
  }

  let currentFilters: PieceFixedValueFilter = {};
  let filtersActive = false;
  $: {
    filtersActive = 
      !!currentFilters.source || 
      !!currentFilters.type ||
      currentFilters.consumptionStatus === "all" ||
      currentFilters.consumptionStatus === "consumed" ||
      !!currentFilters.releaseYearStart ||
      !!currentFilters.releaseYearEnd;
  }

  let showPiecesPlaceholders = false;

  const searchGridClasses = "search-bar mb-8 grid grid-cols-12 gap-2";

  function filterPiecesBySearch(_searchStr: string, pieces: Piece[] | null): Piece[] | null {
    if (!pieces) return null;
    if (!searchStr) return pieces;
    return pieces.filter((piece) => piece.name.toLocaleLowerCase().includes(_searchStr));
  }

  let pieces$: Unsubscribe;
  function subscribeToPieces() {
    showPiecesPlaceholders = true;
    clearSearch();
    pieces$ = getPieces((ps) => {
      pieces = filterPiecesBySearch(searchStr, ps);
      pieces = pieces!.filter((piece) => {
        if (!piece.releaseYear) return false;
        return piece.releaseYear >= (currentFilters.releaseYearStart || 0) && 
               piece.releaseYear <= (currentFilters.releaseYearEnd || Infinity);
      });
      if (showPiecesPlaceholders) showPiecesPlaceholders = false;
    }, currentFilters);
  }

  function init() {
    subscribeToPieces();
  }

  onMount(() => {
    authUser$.subscribe((user) => {
      if (user === null) return goto("/login", { replaceState: true });
      if (!authUser && !!user) {
        authUser = user;
        init();  
      }
      authUser = user;
    });
    
    function handlePopState() {
      modalStore.update((modals) => {
        modals.pop();
        return modals;
      })
    }
    modalStore.subscribe((modals) => {
      if (modals.length === 1) {
        window.location.hash = modals[0].meta?.["id"] || 'modal';
        addEventListener("popstate", handlePopState);
      }
      if (modals.length) {
        document.body.style.overflow = "hidden";
      } else {
        if (window.location.hash) {
          history.replaceState({}, document.title, window.location.href.split('#')[0]);
        }
        removeEventListener("popstate", handlePopState)
        document.body.style.overflow = "initial";
      }
    })

    return () => {
      pieces$ && pieces$();
    }
  })

  function handleSearchSubmit(e: any) {
    if (e.key !== "Enter") return;
    searchStr = (e.target.value as string).toLowerCase();
  }

  function clearSearch() {
    searchStr = "";
    if (searchInputEl) {
      searchInputEl.value = "";
    }
  }

  function handleFormUpdateSuccess() {
    modalStore.close();
    const t: ToastSettings = {
      message: 'Piece updated! 🎉',
      background: 'variant-filled-success',
      hideDismiss: true,
    };
    toastStore.trigger(t);
  }

  function handleFiltersFormSubmit(filters: PieceFixedValueFilter) {
    currentFilters = filters;
    subscribeToPieces();
  }

  function openFiltersModal(e: MouseEvent) {
    const formModalComponent: ModalComponent = {
      ref: PieceFiltersForm,
      props: {
        done: handleFiltersFormSubmit,
        currentFilters,
        close: onCloseModalClick,
      },
    }
    const formModal: ModalSettings = {
      type: "component",
      component: formModalComponent,
      meta: { id: "piece-filters" }
    }
    modalStore.trigger(formModal);
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
      meta: { id: "piece" }
    }
    modalStore.trigger(formModal);
  }

  function handleFormCreateSuccess() {
    modalStore.close();
    const t: ToastSettings = {
      message: 'Piece created! 🎉',
      background: 'variant-filled-success',
      hideDismiss: true,
    };
    toastStore.trigger(t);
  }
  function onCloseModalClick() {
    modalStore.close();
  }

  function handleGoToTopButtonClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      meta: { id: "piece" },
    }
    modalStore.trigger(formModal);
  }

  function undoDelete(pieceId: string) {
    updatePiece(pieceId, { isDeleted: false, deletedAt: null });
    undoDeleteFn = null;
  }
  
  function undoConsumed(pieceId: string, newValue: boolean) {
    setConsumedValue(pieceId, newValue);
    undoConsumedFn = null;
  }

  function handlePieceDeleted(e: CustomEvent<{ pieceId: string; isDeleted: boolean }>) {
    const { pieceId, isDeleted } = e.detail;
    if (isDeleted) {
      // @ts-ignore
      undoDeleteFn = undoDelete.bind(this, pieceId);
      setTimeout(() => {
        if (!!undoDeleteFn) undoDeleteFn = null;
      }, 4000);
    }
  }

  function handlePieceConsumed(e: CustomEvent<{ pieceId: string, consumed: boolean }>) {
    const { pieceId, consumed } = e.detail;
    if (consumed) {
      // @ts-ignore
      undoConsumedFn = undoConsumed.bind(this, pieceId, !consumed);
      setTimeout(() => {
        if (!!undoConsumedFn) undoConsumedFn = null;
      }, 4000);
    }
  }
</script>

<style lang="scss">
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
  .undo-popup {
    position: fixed;
    top: -50px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 9999;
    transition: top 200ms cubic-bezier(.31,.94,1,.99);

    &.show {
      top: 30px;
    }

    &--second {
      &.show {
        top: 83px;
      }
    }
  }

  .add-piece-btn, .go-to-top-btn {
    svg {
      fill: currentColor;
    }
  }
  .go-to-top-btn {
    bottom: -4.5rem;
    opacity: 0;
    transition: all 200ms cubic-bezier(.31,.94,1,.99);
    &.shown {
      bottom: 1.5rem;
      opacity: 1;
    }
  }
</style>

<section class="pieces-page">
  <div class:show={!!undoDeleteFn} class="undo-popup btn btn-sm bg-gradient-to-br variant-gradient-error-warning">
    Piece deleted &nbsp; <button on:click={() => undoDeleteFn ? undoDeleteFn() : null} type="button" class="btn btn-sm variant-ghost-success">undo</button>
  </div>
  <div class:undo-popup--second={!!undoDeleteFn} class:show={!!undoConsumedFn} class="undo-popup btn btn-sm bg-gradient-to-br variant-gradient-primary-tertiary">
    Marked as consumed &nbsp; <button on:click={() => undoConsumedFn ? undoConsumedFn() : null} type="button" class="btn btn-sm variant-ghost-success">undo</button>
  </div>

  {#if !displayedPieces} 
    <div class={searchGridClasses}>
      <div class="placeholder animate-pulse col-span-10 md:col-span-11" style="height: 42px"></div>
      <div class="placeholder animate-pulse col-span-2 md:col-span-1" style="height: 42px"></div>
    </div>
  {/if}
  
  {#if !!pieces?.length}
    <div class={searchGridClasses}>
      <!-- svelte-ignore a11y-positive-tabindex -->
      <input 
        bind:this={searchInputEl}
        on:keyup={handleSearchSubmit}
        autocomplete="off" 
        autocapitalize="none"
        id="piece-search-input" 
        tabindex="1" 
        class="input col-span-10 md:col-span-11" 
        type="text" 
        placeholder="Search in your pieces" 
      />

      <button 
        on:click={openFiltersModal} 
        type="button" 
        class="btn col-span-2 md:col-span-1 p-0"
        class:bg-gradient-to-br={filtersActive}
        class:variant-gradient-secondary-primary={filtersActive}
        class:variant-filled={!filtersActive}
      >
        <svg fill={filtersActive ? "#fff" : undefined} stroke={filtersActive ? "#fff" : undefined} width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M23 0l-9 14.146v7.73l-3.996 2.124v-9.853l-9.004-14.147h22zm-20.249 1l8.253 12.853v8.491l1.996-1.071v-7.419l8.229-12.854h-18.478z"/></svg>
      </button>
    </div>
  {/if}

  {#if filtersActive}
    <PieceFiltersBadges show={true} currentFilters={currentFilters} fixedFilters={false} />
    <PieceFiltersBadges show={fixedFilters} currentFilters={currentFilters} fixedFilters={true} />
  {/if}

  {#if pieces?.length === 0}
    <div class="p4 mt-16">
      {#if filtersActive && !showPiecesPlaceholders}
        <p class="text-center mt-4 mb-4" style="font-size: 4rem;">
          🫥
        </p>
        <p class="text-center text-xl p-4">
          Could't find anything with those filters
        </p>
        <div class="flex justify-center mb-4">
          <button on:click={openFiltersModal} type="button" class="btn w-full max-w-xs btn-sm variant-filled clear-search-button">
            Change filters
          </button>
        </div>
      {:else if !showPiecesPlaceholders}
        <p class="text-center mt-4 mb-4" style="font-size: 4rem;">
          🗿
        </p>
        <p class="text-center text-xl p-4">
          You have no pieces. Use the button below to start!
        </p>
      {/if}
    </div>
  {/if}
  
  
  {#if !!displayedPieces && !!searchStr}
    <div class="flex justify-center mb-4">
      <button on:click={clearSearch} type="button" class="btn w-full max-w-xs btn-sm variant-filled clear-search-button">
        Clear search
      </button>
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

    {#if !!displayedPieces && !showPiecesPlaceholders}
      {#each displayedPieces as piece, index (piece.id)}
        <PieceCard on:pieceConsumedToggle={handlePieceConsumed} on:pieceDeletedToggle={handlePieceDeleted} on:editButtonClick={openEditModal} {piece} {index} />
      {/each}
  
      <button on:click={handlePlusButtonClick} type="button" class="add-piece-btn btn-icon btn-icon-xl bg-gradient-to-br variant-gradient-tertiary-primary fixed bottom-6 right-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg>
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

    <button class:shown={showGoToTopButton} on:click={handleGoToTopButtonClick}  type="button" class="go-to-top-btn btn-icon btn-icon-xl variant-filled fixed left-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m18.787 9.473s-4.505-4.502-6.259-6.255c-.147-.146-.339-.22-.53-.22-.192 0-.384.074-.531.22-1.753 1.753-6.256 6.252-6.256 6.252-.147.147-.219.339-.217.532.001.19.075.38.221.525.292.293.766.295 1.056.004l4.977-4.976v14.692c0 .414.336.75.75.75.413 0 .75-.336.75-.75v-14.692l4.978 4.978c.289.29.762.287 1.055-.006.145-.145.219-.335.221-.525.002-.192-.07-.384-.215-.529z" fill-rule="nonzero"/></svg>
    </button>
  </div>
</section>
<svelte:window bind:scrollY={yScroll} />