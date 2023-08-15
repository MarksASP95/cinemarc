<style lang="scss">
  .main-container {
    padding: 0 20px 20px;
    max-width: 1920px;
    margin: 0 auto;

    @media (min-width: 768px) {
      padding: 0 120px 40px;
    }
  }

  header.cinemarc-header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .cinemarc-home {
      font-family: "Sono";
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { authUser$ } from '../../auth/auth.store';
  import type { CinemarcUser } from '../../models/user.model';
  import { signOut } from '../../client/firebase/auth.fire';

  let currentUser: CinemarcUser | undefined | null;
  onMount(() => {
    authUser$.subscribe((user) => {
      currentUser = user;
    })
  });

  function handleSignOutClick() {
    signOut();
  }
</script>

<main class="main-container">
  {#if currentUser}
    <header class="cinemarc-header">
      <h1 class="cinemarc-home">
        cinemarc <span class="font-mono">({ currentUser?.username || currentUser?.email || '' })</span>
      </h1>
      <button on:click={handleSignOutClick} type="button" class="btn btn-sm bg-gradient-to-br variant-gradient-error-success">
        <span>sign out</span>
        <span>👋</span>
      </button>
    </header>
    {:else}
    <header class="cinemarc-header">
      <div class="flex">
        <h1 class="text-center cinemarc-home mr-3">
          cinemarc
        </h1>
        <span class="placeholder animate-pulse" style="height: 25px; width: 100px;"></span>
      </div>
      <div class="placeholder animate-pulse" style="height: 32px; width: 100px;"></div>
    </header>
{/if}

  <slot />
</main>