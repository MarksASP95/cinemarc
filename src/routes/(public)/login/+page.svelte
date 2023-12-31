<script lang="ts">
  import { createForm } from "felte";
  import { signInWithCustomToken, signInWithEmailAndPassword } from "firebase/auth";
  import { goto } from "$app/navigation";
  import Spinner from "../../../client/components/Spinner.svelte";
  import { toastStore, type ToastSettings } from "@skeletonlabs/skeleton";
  import { onMount } from "svelte";
  import { authUser$ } from "../../../auth/auth.store";
  import { auth } from "../../../store/firebase-auth.store";
  import { CinemarcAPI } from "../../../client/cinemarc-api/cinemarc-api";
  import type { SignInResult } from "../../../models/user.model";

  let submitting = false;
  let formErrors: Record<string, string> = {};

  onMount(() => {
    authUser$.subscribe((user) => {
      if (!!user) return goto("/pieces", { replaceState: true });
    })
  });

  const signInResultDict: Record<SignInResult, string> = {
    server_could_not_respond: "Server could not respond",
    success: "Welcome back! ❤️",
    user_does_not_exist: "User does not exist",
    user_not_active: "User not active",
    wrong_credentials: "Wrong username, email or password 🕵️‍♂️",
  }

  const { form: loginForm } = createForm({
    onSubmit: (values) => {
      const requiredFields = ["usernameOrEmail", "password"];
        const errors: Record<string, string> = {};
        requiredFields.forEach((field) => {
          if (!values[field]) errors[field] = "This field is required";
        });
        if (Object.keys(errors).length) {
          formErrors = errors;
          return;
        }
        formErrors = {};

        const { usernameOrEmail, password } = values;

        submitting = true;
        CinemarcAPI.auth.signIn(usernameOrEmail, password)
        .then(({ token, message }) => {
          if (token) {
            signInWithCustomToken(auth(), token)
              .then(() => {
                const t: ToastSettings = {
                  message: signInResultDict["success"],
                  background: 'variant-filled-success',
                  hideDismiss: true,
                  timeout: 800,
                };
                toastStore.trigger(t);
              goto("/pieces", { replaceState: true });
              })
          } else {
            const t: ToastSettings = {
              message: signInResultDict[message as SignInResult] || "An error has ocurred",
              background: 'variant-filled-error',
              hideDismiss: true,
            };
            toastStore.trigger(t);
            submitting = false;
          }
        })
        .catch((err) => {
          console.log(err)
          submitting = false;
        });
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
      <span>Email or username</span>
      <input 
        readonly={submitting}
        name="usernameOrEmail" 
        class="input"  
        type="text" 
        autocorrect="off" 
        autocapitalize="none"
      />
      {#if formErrors.usernameOrEmail}
        <small class="text-error-500">{formErrors.usernameOrEmail}</small>
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