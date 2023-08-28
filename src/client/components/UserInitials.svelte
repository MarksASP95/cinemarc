<script lang="ts">
  import { onMount } from "svelte";

  export let username: string;

  function getUsernameInitial(username: string): string {
    return username[0];
  }
  
  let initials = "";

  onMount(() => {
    if (!!username) {
      initials = getUsernameInitial(username);
    }
  })
</script>

<style lang="scss">
  .initial-text {
    font-family: "Sono";
  }
</style>

<div class="rounded-full w-16 h-16 overflow-hidden flex justify-center items-center variant-glass-surface">
  <p class="text-center initial-text text-2xl">
    {initials}
  </p>
</div>