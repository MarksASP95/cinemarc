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
  import { onMount } from 'svelte';
  import { authUser$ } from '../../auth/auth.store';
  import type { CinemarcUser } from '../../models/user.model';

  let currentUser: CinemarcUser | undefined | null;
  onMount(() => {
    authUser$.subscribe((user) => {
      currentUser = user;
    })
  })
</script>

<main class="main-container">
  <slot />
</main>