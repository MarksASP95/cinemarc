<script lang="ts">
  import { createForm } from "felte";
  import Spinner from "../../../../../client/components/Spinner.svelte";
  import { toastStore, type ToastSettings } from "@skeletonlabs/skeleton";

  let formErrors: Record<string, string> = {};
  let invitingUser = false;

  const { form: inviteUserForm } = createForm({
    onSubmit: (values) => {
      const requiredFields = ["email", "rank"];
      const errors: Record<string, string> = {};
      formErrors = {};
      requiredFields.forEach((field) => {
        if (!values[field]) errors[field] = "This field is required";
      });
      if (Object.keys(errors).length) {
        formErrors = errors;
        return;
      }

      invitingUser = true;

      fetch("/api/send-user-invitation", {
        method: "POST",
        body: JSON.stringify({
          email: values.email.trim(),
          rank: values.rank.trim(),
        }),
      })
        .then((res) => {
          console.log(res);
          if (res.ok) {
            const t = {
              message: 'Invitation sent 📨',
              background: 'variant-filled-success',
            };
            toastStore.trigger(t);
          } else {
            return res.text().then((text) => { throw new Error(text) });
          }
          
        })
        .catch((error) => {
          const t: ToastSettings = {
              message: JSON.parse(error.message).message,
              background: 'variant-filled-error',
            };
          toastStore.trigger(t);
          console.log(error);
        })
        .finally(() => {
          invitingUser = false;
        });
    }
  });
</script>


<div class="m-9 flex flex-col justify-center align-center">
  <h1 class="text-center text-xl mb-4 font-mono">
    Invite user
  </h1>
  <form use:inviteUserForm class="flex-1 border border-surface-500 p-4 space-y-4 rounded-container-token">
    <label class="label">
      <span>Email</span>
      <input 
        disabled={invitingUser}
        name="email" 
        class="input"  
        type="email" 
        autocomplete="off"
      />
      {#if formErrors.email}
        <small class="text-error-500">{formErrors.email}</small>
      {/if}
    </label>
    <label class="label">
      <span>Rank</span>
      <select name="rank" class="select" disabled={invitingUser}>
        <option value="" selected disabled>Select a rank</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      {#if formErrors.rank}
        <small class="text-error-500">{formErrors.rank}</small>
      {/if}
    </label>
    <footer class="modal-footer">
        <!-- <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button> -->
        <div class="flex justify-center">
          <button disabled={invitingUser} class="btn variant-filled" type="submit">
            {#if invitingUser}
              <Spinner forButton />
            {:else}
              Invite
            {/if}
          </button>
        </div>
    </footer>
  </form>
  
</div>