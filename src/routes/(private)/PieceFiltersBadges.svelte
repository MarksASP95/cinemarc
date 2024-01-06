<script lang="ts">
  import { onMount } from "svelte";
  import { badgeClassByPieceSource, consumptionStatusDict, pieceSourceDict, pieceTypeDict } from "../../constants/piece.const";
  import type { PieceFixedValueFilter } from "../../models/piece.model";

    export let show = false;
    export let fixedFilters = false;
    export let currentFilters: PieceFixedValueFilter = {};

    onMount(() => {

    });
</script>

<style lang="scss">
    .piece-filters {
        top: -3rem;
        transition: top 200ms cubic-bezier(.31,.94,1,.99);

        &.show {
            top: 0.375rem;
        }
    }

</style>

<div
    class="piece-filters variant-filled-surface p-2 flex items-center rounded mb-4 z-10"
    class:show={show}
    class:fixed={fixedFilters}
    class:top-1.5={fixedFilters}
>
    <div class="flex">
        {#if currentFilters.source}
            <div class="flex me-2">
            <span class="badge variant-filled rounded-r-none">source</span>
            <span class="badge rounded-l-none {badgeClassByPieceSource[currentFilters.source]}">
                {pieceSourceDict[currentFilters.source].toLowerCase()}
            </span>
            </div>
        {/if}
        {#if currentFilters.type}
            <div class="flex me-2">
            <span class="badge variant-filled rounded-r-none">type</span>
            <span class="badge rounded-l-none variant-filled">
                {pieceTypeDict[currentFilters.type].toLowerCase()}
            </span>
            </div>
        {/if}
        {#if !!currentFilters.consumptionStatus && currentFilters.consumptionStatus !== "not-consumed"}
            <div class="flex me-2">
            <span class="badge variant-filled rounded-r-none">consumption</span>
            <span class="badge rounded-l-none variant-filled">
                {consumptionStatusDict[currentFilters.consumptionStatus].toLowerCase()}
            </span>
            </div>
        {/if}
    </div>
</div>