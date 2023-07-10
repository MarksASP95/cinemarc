<script lang="ts">
  import PieceCard from "../../../client/components/PieceCard.svelte";
import type { Paged } from "../../../models/general.model";
  import type { Piece } from "../../../models/piece.model";

  export let data: { pieces: Piece[] };

  const pieces = data.pieces;
</script>

<div class="search-bar my-8">
  <input class="input" type="text" placeholder="Search for a movie, series, podcast, or anything" />
</div>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  {#each pieces as piece}
    <PieceCard {piece} />
  {/each}
</div>