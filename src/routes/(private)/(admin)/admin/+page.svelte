<script lang="ts">
  import { Avatar, modalStore, popup, toastStore, type PopupSettings } from "@skeletonlabs/skeleton";
  import { getUsers } from "../../../../client/pieces/user.fire";
  import type { CinemarcUser } from "../../../../models/user.model";
  import UserInitials from "../../../../client/components/UserInitials.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { CinemarcAPI } from "../../../../client/cinemarc-api/cinemarc-api";

  let users: CinemarcUser[] | null = null;
  getUsers((u) => {
    users = u;
  })

  const settingBlockedDict: Record<string, boolean> = {};

  function toggleUserBlocked(id: string, isBlocked: boolean) {
    settingBlockedDict[id] = true;
    CinemarcAPI.auth.blockUser(id, isBlocked)
      .then(({ success, message }) => {
        if (success) {
          toastStore.trigger({
            message: `User ${isBlocked ? 'unblocked' : 'blocked'}`,
            background: 'variant-filled-success',
          });
        } else {
          toastStore.trigger({
            message: message || "An error has ocurred",
            background: 'variant-filled-error',
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toastStore.trigger({
            message: "An error has ocurred",
            background: 'variant-filled-error',
          });
      })
      .finally(() => {
        settingBlockedDict[id] = false;
      });
  }
  function deleteUser(id: string) {

  }
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
        <div use:popup={{ event: 'click', target: user.id, placement: 'top' }} class="card cursor-pointer">
          <div 
            data-popup={user.id} class="card p-4 w-72 bg-gradient-to-br variant-gradient-success-warning shadow-xl z-10 popup-positioning"
          >
          <p class="h4 mb-4 font-medium">{user.username}</p>
            <div class="flex flex-col">
              <button 
                type="button" 
                class:variant-gradient-primary-secondary={!user.isActive} 
                class:variant-gradient-warning-error={user.isActive}
                class="btn btn-sm bg-gradient-to-br mb-3"
                on:click={() => toggleUserBlocked(user.id, !user.isActive)}
                disabled={settingBlockedDict[user.id]}
              >
                {#if user.isActive}
                  Block 🖕
                {:else}
                  Unblock 👌
                {/if}
              </button>
        
              {#if !user.isDeleted}
                <button on:click={() => deleteUser(user.id)} type="button" class="btn variant-filled-error btn-sm">
                  Delete 🗑️
                </button>
              {/if}
            </div>
          </div>
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
        </div>
      {/each}
    </div>
  {:else}

  {/if}
</div>