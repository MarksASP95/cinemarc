<script lang="ts">
  import { createForm } from "felte";
  import Spinner from "../../../../../client/components/Spinner.svelte";
  import { toastStore, type ToastSettings } from "@skeletonlabs/skeleton";
  import { CinemarcAPI } from "../../../../../client/cinemarc-api/cinemarc-api";
  import type { CinemarcUserRank } from "../../../../../models/user.model";

  let formErrors: Record<string, string> = {};
  let invitingUser = false;

  const { form: inviteUserForm } = createForm({
    onSubmit: (values) => {
      const requiredFields = ["email"];
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

      const email: string = values.email;

      CinemarcAPI.auth.sendUserInvitation(email.trim())
        .then(({ success, message }) => {
          if (success) {
            const t = {
              message: 'Invitation sent 📨',
              background: 'variant-filled-success',
            };
            toastStore.trigger(t);
          } else {
            const t: ToastSettings = {
              message,
              background: 'variant-filled-error',
              hideDismiss: true,
            };
            toastStore.trigger(t);
          }
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