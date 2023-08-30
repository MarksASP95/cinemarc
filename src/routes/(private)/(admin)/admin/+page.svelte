<script lang="ts">
  import { Avatar } from "@skeletonlabs/skeleton";
  import { getUsers } from "../../../../client/pieces/user.fire";
  import type { CinemarcUser } from "../../../../models/user.model";
  import UserInitials from "../../../../client/components/UserInitials.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let users: CinemarcUser[] | null = null;
  getUsers((u) => {
    users = u;
  })
</script>

<style lang="scss">

</style>

<div class="admin-page">
  <h2 class="text-xl text-center mb-8">
    admin stuff
  </h2>

  <div class="flex justify-between mb-4">
    <h3 class="text-lg">
      Users
    </h3>
    <a href="/users/invite">
      <button type="button" class="btn btn-sm bg-gradient-to-br variant-gradient-primary-secondary">
        <span>🙋‍♂️ Invite</span>
      </button>
    </a>
  </div>
  {#if !!users}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {#each users as user}
        <div class="card">
          <header class="flex flex-col justify-center items-center p-4">
            {#if !!user.avatarUrl}
              <Avatar src={user.avatarUrl} />
            {:else}
              <UserInitials username={user.username} />
            {/if}
            <p class="text-center mt-2">
              {user.username}
            </p>
          </header>
          <div class="p-4">
            
          </div>
        </div>
      {/each}
    </div>
  {:else}

  {/if}
</div>