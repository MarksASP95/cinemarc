<style lang="scss">
  @mixin general_layout {
    padding: 0 20px 5px;
    max-width: 1920px;
    margin: 0 auto;
    @media (min-width: 768px) {
      padding: 0 120px 10px;
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

    .username {
      font-family: "Sono";
    }
  }
</style>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { authUser$, rankClaim$ } from '../../auth/auth.store';
  import type { CinemarcUser } from '../../models/user.model';
  import { signOut } from '../../client/firebase/auth.fire';
  import { Drawer, LightSwitch, drawerStore } from '@skeletonlabs/skeleton';
  import { cinemarcVersion$ } from '../../store/variables.store';
  import { initMode } from '../../utils/mode.utils';
  import { browser } from '$app/environment';
  import UserInitials from '../../client/components/UserInitials.svelte';
  import type { Unsubscribe } from 'firebase/auth';

  if (browser) {
    initMode();
  }

  let isAdmin: boolean;
  let currentUser: CinemarcUser | undefined | null;
  let version: string | undefined;

  let authUserSub: Unsubscribe;
  let versionSub: Unsubscribe;
  let rankSub: Unsubscribe;
  onMount(() => {
    authUserSub = authUser$.subscribe((user) => {
      currentUser = user;
    })
    versionSub = cinemarcVersion$.subscribe((v) => {
      version = v?.value;
    })
    rankSub = rankClaim$.subscribe((rank) => {
      isAdmin = rank === "admin";
    })

    function handlePopState() {
      drawerStore.close();
    }
    drawerStore.subscribe(({ open }) => {
      if (open) {
        window.location.hash = 'drawer';
        addEventListener("popstate", handlePopState);
      } else {
        if (window.location.hash) {
          history.replaceState({}, document.title, window.location.href.split('#')[0]);
        }
        removeEventListener("popstate", handlePopState)
      }
    })
  });

  onDestroy(() => {
    if (authUserSub) authUserSub();
    if (versionSub) versionSub();
    if (rankSub) rankSub();
  })

  function handleSignOutClick() {
    signOut();
  }

  function openDrawer() {
    drawerStore.open({
      position: "top",
      height: "auto",
    });
  }
</script>

{#if !!currentUser}
  <Drawer>
    <div class="drawer-content">
      <div class="flex justify-end">
        <LightSwitch />
      </div>
      <div class="flex justify-center items-center flex-col pb-4">
        <div class="rounded-full w-16 h-16 overflow-hidden flex justify-center items-center variant-glass-surface">
          {#if currentUser.avatarUrl}
            <img class="object-cover" src={currentUser.avatarUrl} alt={currentUser.username}>
          {:else}
            <UserInitials username={currentUser.username} />
          {/if}
        </div>

        <p class="username">
          {currentUser.username}
        </p>
        <!-- <Avatar src="" width="w-32" rounded="rounded-full" /> -->
      </div>

      {#if isAdmin}
        <a class="text-center block hover:underline" href="/admin">
          <small>admin dashboard</small>
        </a>
      {/if}

      <div class="flex justify-center items-center flex-col mt-4">
        <button on:click={handleSignOutClick} type="button" class="btn btn-sm bg-gradient-to-br variant-gradient-error-success">
          <span>sign out</span>
          <span>👋</span>
        </button>

        {#if !!version}
          <small class="mt-4 text-xs text-tertiary-500">
            Cinemarc {version}
          </small>
        {/if}
      </div>
    </div>
  </Drawer>
{/if}

<main class="main-container">
  {#if currentUser}
    <header class="cinemarc-header">
      <h1 class="cinemarc-home">
        <a class="hover:underline" href="/">cinemarc</a> <span class="font-mono">({ currentUser?.username || currentUser?.email || '' })</span>
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