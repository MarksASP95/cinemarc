<script>
  import { Modal, Toast } from "@skeletonlabs/skeleton";
  import "../app.postcss";
  import { listenToAuthChanges } from "../client/firebase/auth.fire";
  import { browser } from "$app/environment";
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from '@skeletonlabs/skeleton';
  
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
  
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