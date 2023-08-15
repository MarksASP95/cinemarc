<script lang="ts">
    import { createForm } from "felte";
    import Spinner from "../../../../client/components/Spinner.svelte";
    import { toastStore, type ToastSettings } from "@skeletonlabs/skeleton";
    import { createUserWithEmailAndPassword } from "firebase/auth";
  import { uploadFile } from "../../../../client/firebase/storage.fire";
  import { goto } from "$app/navigation";
  import { USERNAME_MAX_LENGTH, checkPassword, checkUsername } from "../../../../constants/user.const";
  import { CinemarcAPI } from "../../../../client/cinemarc-api/cinemarc-api";
  
    export let data: { email: string, uid: string };

    const { email, uid: userId } = data;
    let formErrors: Record<string, string> = {};
    let submitting = false;
    let imageFile: File | null = null;

    const { form: inviteUserForm, setInitialValues } = createForm({
      onSubmit: (values) => {
        const requiredFields = ["username", "password"];
        const errors: Record<string, string> = {};
        formErrors = {};
        requiredFields.forEach((field) => {
          if (!values[field]) errors[field] = "This field is required";
        });
        if (Object.keys(errors).length) {
          formErrors = errors;
        }
  
        // return;
        const { username, password, password_repeat } = values;

        const usernameError = checkUsername(username);
        if (usernameError) {
          formErrors.username = usernameError;
        }

        const passwordError = checkPassword(password);
        if (passwordError) {
          formErrors.password = passwordError;
        }

        if (password !== password_repeat) {
          formErrors.password_repeat = "Passwords don't match"
        }

        if (Object.keys(formErrors).length) return;

        let uploadImageFile: Promise<string | null> = Promise.resolve(null);
        if (imageFile) {
            const filePath = `user_avatars/${new Date().getTime()}_${imageFile.name}`;
            uploadImageFile = uploadFile(filePath, imageFile).then(({ url }) => url);
        }

        submitting = true;
        uploadImageFile
            .then((url) => {
                return CinemarcAPI.auth.register(
                  userId,
                  username,
                  password,
                  url || undefined,
                )
            })
            .then(({ success, message }) => {
              if (success) {
                const t = {
                  message: 'Welcome! 👐',
                  background: 'variant-filled-success',
                };
                toastStore.trigger(t);
                goto("/login", { replaceState: true });
              } else {
                const t: ToastSettings = {
                  message: message,
                  background: 'variant-filled-error',
                  hideDismiss: true,
                };
                toastStore.trigger(t);
              }
              
            })
            .catch((error) => {
              const t: ToastSettings = {
                  message: "An error ocurred. Try  again",
                  background: 'variant-filled-error',
                  hideDismiss: true,
                };
              toastStore.trigger(t);
              console.log(error);
            })
            .finally(() => {
              submitting = false;
            });
      }
    });

    setInitialValues({ email });

    function handleImageInputChange(e: any) {
        imageFile = e.target.files[0] || null;
    }
  </script>
  
  
  <div class="m-9 flex justify-center align-center">
    <form use:inviteUserForm class="flex-1 border border-surface-500 p-4 space-y-4 rounded-container-token">
      <label class="label">
        <span>Email</span>
        <input 
          readonly={true}
          name="email" 
          class="input"  
          type="email" 
          autocomplete="off"
        />
      </label>
      <label class="label">
        <span>Username</span>
        <input 
          disabled={submitting}
          name="username" 
          class="input"  
          type="text" 
          autocomplete="off"
          maxlength={USERNAME_MAX_LENGTH}
        />
        <small class="block">Can only contain letters (at least 1), numbers and underscores</small>
        {#if formErrors.username}
            <small class="text-error-500">{formErrors.username}</small>
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
      <label class="label">
        <span>Repeat password</span>
        <input 
          disabled={submitting}
          name="password_repeat" 
          class="input"  
          type="password" 
          autocomplete="off"
        />
        {#if formErrors.password_repeat}
            <small class="text-error-500">{formErrors.password_repeat}</small>
        {/if}
      </label>
      <label class="label">
        <span>Image (optional)</span>
        <input 
          disabled={submitting}
          accept=".png, .jpg, .jpeg"
          on:change={handleImageInputChange}
          name="image" 
          class="input"  
          type="file" 
        />
      </label>
      <footer class="modal-footer">
          <!-- <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button> -->
          <div class="flex justify-center">
            <button disabled={submitting} class="btn variant-filled" type="submit">
              {#if submitting}
                <Spinner forButton />
              {:else}
                Register
              {/if}
            </button>
          </div>
      </footer>
    </form>
    
  </div>