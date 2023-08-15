<style lang="scss">
  @mixin general_layout {
    padding: 0 20px 20px;
    max-width: 1920px;
    margin: 0 auto;
    @media (min-width: 768px) {
      padding: 0 120px 40px;
    }
  }

  .main-container {
    @include general_layout;
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

  .drawer-content {
    @include general_layout;
    padding-top: 20px;
    @media (min-width: 768px) {
      padding-top: 40px;
    }

    .initial-text {
      font-family: "Sono";
    }
    .username {
      font-family: "Sono";
    }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { authUser$ } from '../../auth/auth.store';
  import type { CinemarcUser } from '../../models/user.model';
  import { signOut } from '../../client/firebase/auth.fire';
  import { Drawer, drawerStore } from '@skeletonlabs/skeleton';

  let currentUser: CinemarcUser | undefined | null;
  onMount(() => {
    authUser$.subscribe((user) => {
      currentUser = user;
    })
  });

  function handleSignOutClick() {
    signOut();
  }

  function openDrawer() {
    drawerStore.open({
      position: "top",
      height: "auto",
    });
  }

  function getUsernameInitial(username: string): string {
    return username[0];
  }
</script>

{#if !!currentUser}
  <Drawer>
    <div class="drawer-content">
      <div class="flex justify-center items-center flex-col pb-4">
        <div class="rounded-full w-16 h-16 overflow-hidden flex justify-center items-center variant-glass-surface">
          {#if currentUser.avatarUrl}
            <img class="object-cover" src={currentUser.avatarUrl} alt={currentUser.username}>
          {:else}
            <p class="text-center initial-text text-2xl">
              {getUsernameInitial(currentUser.username)}
            </p>
          {/if}
        </div>

        <p class="username">
          {currentUser.username}
        </p>
        <!-- <Avatar src="" width="w-32" rounded="rounded-full" /> -->
      </div>
      <div class="flex justify-center mt-4">
        <button on:click={handleSignOutClick} type="button" class="btn btn-sm bg-gradient-to-br variant-gradient-error-success">
          <span>sign out</span>
          <span>👋</span>
        </button>
      </div>
    </div>
  </Drawer>
{/if}

<main class="main-container">
  {#if currentUser}
    <header class="cinemarc-header">
      <h1 class="cinemarc-home">
        cinemarc <span class="font-mono">({ currentUser?.username || currentUser?.email || '' })</span>
      </h1>
      <button on:click={openDrawer} type="button" class="btn btn-sm bg-gradient-to-br variant-gradient-tertiary-secondary">
        <span>⚙️</span>
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
      <div class="placeholder animate-pulse" style="height: 32px; width: 40px;"></div>
    </header>
{/if}

  <slot />
</main>