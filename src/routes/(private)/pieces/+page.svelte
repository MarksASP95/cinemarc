<script lang="ts">
  import { onDestroy } from "svelte";
  import PieceCard from "../../../client/components/PieceCard.svelte";
  import Spinner from "../../../client/components/Spinner.svelte";
  import { getPieces } from "../../../client/pieces/piece.fire";
  import type { Piece } from "../../../models/piece.model";

  let pieces: Piece[] | null = null;

  const pieces$ = getPieces((ps) => {
    pieces = ps;
  });

  onDestroy(() => {
    pieces$();
  });
  
</script>

<div class="search-bar my-8">
  <!-- svelte-ignore a11y-positive-tabindex -->
  <input tabindex="1" class="input" type="text" placeholder="Search for a movie, series, podcast, or anything" />
</div>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  {#if !!pieces}
    {#each pieces as piece, index}
      <PieceCard {piece} {index} />
    {/each}
  {:else}
    <Spinner />
  {/if}

  
</div>