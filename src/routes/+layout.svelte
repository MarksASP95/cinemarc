<script>
  import { Modal, Toast } from "@skeletonlabs/skeleton";
  import "../app.postcss";
  import { listenToAuthChanges } from "../client/firebase/auth.fire";
  import { browser } from "$app/environment";
  
  if (browser) {
    listenToAuthChanges();
  }
</script>

<svelte:head>
  <title>Cinemarc</title>
</svelte:head>

<style style="scss">
  @import "../styles/styles.scss";
</style>

<slot />
<Modal />
<Toast />