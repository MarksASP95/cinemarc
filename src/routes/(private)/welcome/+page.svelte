<script lang="ts">
  import type { Piece } from "../../../models/piece.model";

  export let data: { pieces: Piece[]; };

  const pieces = data.pieces;

  console.log(pieces)
</script>

<div class="search-bar my-8">
  <input class="input" type="text" placeholder="Search for a movie, series, podcast, or anything" />
</div>