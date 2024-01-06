<script lang="ts">
  import { Toast, modalStore } from '@skeletonlabs/skeleton';
  import { createForm } from "felte";
  import type { PieceFilterConsumptionStatus, PieceFixedValueFilter } from '../../models/piece.model';
  import { onMount } from 'svelte';
  import { pieceSourceDict, pieceSources, pieceTypeDict, pieceTypes } from '../../constants/piece.const';

  export let parent: any;
  export let done: Function;
  export let close: Function;
  export let currentFilters: PieceFixedValueFilter;

  const YEAR_MIN = 1900;
  const YEAR_MAX = new Date().getFullYear() + 5;
  const years = Array<number>(YEAR_MAX - YEAR_MIN + 1).fill(0).map((_, i) => YEAR_MAX - i);

  const { form: filtersForm, setFields } = createForm<PieceFixedValueFilter>({
    onSubmit: (values) => {
      const changedKeys: string[] = [];
      Object.entries(values).forEach(([key, newValue]) => {
        if (newValue !== currentFilters[key as keyof PieceFixedValueFilter]) 
          changedKeys.push(key);
      });
      done({
        filters: values,
        changedKeys,
      });
      close();
    },
    transform: (values) => {
      const returnable = { ...(values as Record<string, string | number | undefined>) } ;
      Object.entries(returnable).forEach(([key, value]) => {
        if (key === "releaseYearEnd" || key === "releaseYearStart") {
          returnable[key] = value ? parseInt(value as string) : undefined;
          return;
        }
        returnable[key] = value || undefined;
      });

      return returnable
    }
  });

  function clearFilters() {
    setFields("consumptionStatus", <PieceFilterConsumptionStatus>"not-consumed");
    setFields("type", undefined);
    setFields("source", undefined);
    setFields("releaseYearStart", undefined);
    setFields("releaseYearEnd", undefined);
  }

  onMount(() => {
    setFields("consumptionStatus", currentFilters.consumptionStatus || <PieceFilterConsumptionStatus>"not-consumed");
    setFields("type", currentFilters.type);
    setFields("source", currentFilters.source);
    setFields("releaseYearStart", currentFilters.releaseYearStart);
    setFields("releaseYearEnd", currentFilters.releaseYearEnd);
  });

	const cBase = 'card p-4 w-modal shadow-xl space-y-4 overflow-auto';
	const cHeader = 'text-2xl font-bold flex justify-between';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<Toast />
{#if $modalStore[0]}
	<div style="max-height: 94dvh" class="{cBase}">
    <header class={cHeader}>
      <span>
          Filters
      </span>

      <button class="text-base" on:click={() => close()}>
        ❌
      </button>
    </header>
    
    <form use:filtersForm class="modal-form {cForm}">
      <label class="label">
        <span>Consumption status</span>
        <select name="consumptionStatus" class="select">
            <option value="all">Any</option>
            <option value="not-consumed">Not consumed</option>
            <option value="consumed">Consumed</option>
        </select>
      </label>
      <label class="label">
        <span>Type</span>
        <select name="type" class="select">
          <option value="">Any</option>
          {#each pieceTypes as type}            
            <option value={type}>{pieceTypeDict[type]}</option>
          {/each}
        </select>
      </label>

      <label class="label">
        <span>Source</span>
        <select name="source" class="select">
          <option value="">Any</option>
          {#each pieceSources as source}            
            <option value={source}>{pieceSourceDict[source]}</option>
          {/each}
        </select>
      </label>

      <label class="label">
        <span>Release year</span>
        <div class="flex content-center">
          <select name="releaseYearStart" class="select mr-2">
            <option value="">Any</option>
            {#each years as year}
              <option value={year}>
                {year}
              </option>
            {/each}
          </select>

          <select name="releaseYearEnd" class="select mr-2">
            <option value="">Any</option>
            {#each years as year}
              <option value={year}>
                {year}
              </option>
            {/each}
          </select>
        </div>
      </label>

      <footer class="modal-footer {parent.regionFooter} justify-between">
          <button type="button" on:click={clearFilters}>clear</button>
          <button type="submit" class="btn {parent.buttonPositive}">
            Apply
          </button>
      </footer>
    </form>
		
	</div>
{/if}