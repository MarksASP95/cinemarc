<script>
  import { Modal, Toast, drawerStore} from "@skeletonlabs/skeleton";
  import "../app.postcss";
  import { listenToAuthChanges } from "../client/firebase/auth.fire";
  import { browser } from "$app/environment";
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from '@skeletonlabs/skeleton';
  import { initVersion } from "../client/version/version.fire";
  import { initMode } from "../utils/mode.utils";
  import { afterNavigate } from "$app/navigation";
  
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
  
  if (browser) {
    initMode();
    initVersion();
    listenToAuthChanges();

    afterNavigate(() => {
      drawerStore.close();
    })
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