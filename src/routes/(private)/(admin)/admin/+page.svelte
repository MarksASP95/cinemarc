<script lang="ts">
  import { Avatar } from "@skeletonlabs/skeleton";
  import { getUsers } from "../../../../client/pieces/user.fire";
  import type { CinemarcUser } from "../../../../models/user.model";
  import UserInitials from "../../../../client/components/UserInitials.svelte";

  let users: CinemarcUser[] | null = null;
  getUsers((u) => {
    users = u;
  })
</script>

<style lang="scss">

</style>

<div class="admin-page">
  <h2 class="text-xl text-center">
    admin stuff
  </h2>

  <h3 class="text-lg">
    Users
  </h3>
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