<style>
  .main-container {
    padding: 0 20px;
    max-width: 1920px;
    margin: 0 auto;

    @media (min-width: 768px) {
      padding: 0 120px 40px;
    }
  }
</style>

<script lang="ts">
  import { modalStore, toastStore } from '@skeletonlabs/skeleton';
  import type { ModalSettings, ModalComponent, ToastSettings } from '@skeletonlabs/skeleton';
  import PieceForm from './PieceForm.svelte';

  function handleFormSuccess() {
    modalStore.close();
    const t: ToastSettings = {
      message: 'Piece created! 🎉',
      background: 'variant-filled-success',
    };
    toastStore.trigger(t);
  }

  function handlePlusButtonClick() {
    const formModalComponent: ModalComponent = {
      ref: PieceForm,
      props: {
        success: handleFormSuccess,
      },
    }
    const formModal: ModalSettings = {
      type: "component",
      component: formModalComponent,
    }
    modalStore.trigger(formModal);
  }
</script>

<main class="main-container">
  <slot />
  <button on:click={handlePlusButtonClick} type="button" class="btn-icon btn-icon-xl variant-filled fixed bottom-6 right-6">
    <svg xmlns="http://www.w3.org/2000/svg" fill="#000" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg>
  </button>
</main>