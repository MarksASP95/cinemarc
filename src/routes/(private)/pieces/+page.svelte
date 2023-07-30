<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import PieceCard from "../../../client/components/PieceCard.svelte";
  import Spinner from "../../../client/components/Spinner.svelte";
  import { getPieces } from "../../../client/pieces/piece.fire";
  import type { Piece } from "../../../models/piece.model";
  import { authUser$ } from "../../../auth/auth.store";
  import { get } from "svelte/store";
  import { modalStore, type ModalComponent, type ModalSettings, type ToastSettings, toastStore } from "@skeletonlabs/skeleton";
  import PieceForm from "../PieceForm.svelte";

  let searchStr = ""
  let searchInputEl: HTMLInputElement;

  let pieces: Piece[] | null = null;
  $: displayedPieces = filterPiecesBySearch(searchStr, pieces);

  function filterPiecesBySearch(_searchStr: string, pieces: Piece[] | null): Piece[] | null {
    if (!pieces) return null;
    if (!searchStr) return pieces;
    return pieces.filter((piece) => piece.name.toLocaleLowerCase().includes(_searchStr));
  }

  onMount(() => {
    authUser$.subscribe((user) => {
      if (user === null) return;
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

  function handleFormSuccess() {
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
        success: handleFormSuccess,
        pieceToEdit: piece,
      },
    }
    const formModal: ModalSettings = {
      type: "component",
      component: formModalComponent,
    }
    modalStore.trigger(formModal);
  }
  
</script>

<style>
  .clear-search-button {
    max-width: 200px;
  }
</style>

<div class="search-bar my-8">
  <!-- svelte-ignore a11y-positive-tabindex -->
  <input 
    bind:this={searchInputEl}
    on:keyup={handleSearchSubmit}
    autocomplete="off" 
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


    {#each displayedPieces as piece, index}
      <PieceCard on:editButtonClick={openEditModal} {piece} {index} />
    {/each}
  {:else}
    <Spinner />
  {/if}
</div>