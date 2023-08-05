<script lang="ts">
  import { createForm } from "felte";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { auth } from "../../../client/firebase/config.fire";
  import { goto } from "$app/navigation";
  import Spinner from "../../../client/components/Spinner.svelte";
  import { toastStore, type ToastSettings } from "@skeletonlabs/skeleton";


  let submitting = false;
  let formErrors: Record<string, string> = {};
  const { form: loginForm } = createForm({
    onSubmit: (values) => {
      submitting = true;
      const requiredFields = ["email", "password"];
        const errors: Record<string, string> = {};
        requiredFields.forEach((field) => {
          if (!values[field]) errors[field] = "This field is required";
        });
        if (Object.keys(errors).length) {
          formErrors = errors;
          return;
        }
        formErrors = {};

        const { email, password } = values;

        signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            const t: ToastSettings = {
                message: 'Welcome back! ❤️',
                background: 'variant-filled-success',
                hideDismiss: true,
                timeout: 800,
              };
              toastStore.trigger(t);
            goto("/pieces");
          })
          .catch((err) => {
            if (err.code === "auth/user-not-found") {
              const t: ToastSettings = {
                message: 'Wrong email or password 🕵️‍♂️',
                background: 'variant-filled-error',
              };
              toastStore.trigger(t);
              return
            }

            const t: ToastSettings = {
              message: 'An error has ocurred',
              background: 'variant-filled-error',
            };
            toastStore.trigger(t);
            
          })
          .finally(() => {
            submitting = false;
          })
    }
  });
</script>

<style lang="scss">
  .cinemarc-login {
    font-family: "Sono";
    font-size: 2rem;
  }
</style>

<h1 class="text-center cinemarc-login my-8">
  cinemarc
</h1>
<div class="m-9 flex justify-center align-center">
  <form use:loginForm class="flex-1 border border-surface-500 p-4 space-y-4 rounded-container-token">
    <label class="label">
      <span>Email</span>
      <input 
        readonly={submitting}
        name="email" 
        class="input"  
        type="email" 
      />
      {#if formErrors.email}
        <small class="text-error-500">{formErrors.email}</small>
      {/if}
    </label>
    <label class="label">
      <span>Password</span>
      <input 
        disabled={submitting}
        name="password" 
        class="input"  
        type="password" 
        autocomplete="off"
      />
      {#if formErrors.password}
        <small class="text-error-500">{formErrors.password}</small>
      {/if}
    </label>
    <footer class="modal-footer">
        <!-- <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button> -->
        <div class="flex justify-center">
          <button disabled={submitting} class="btn variant-filled" type="submit">
            {#if submitting}
              <Spinner forButton />
            {:else}
              Sign in
            {/if}
          </button>
        </div>
    </footer>
  </form>
  
</div>