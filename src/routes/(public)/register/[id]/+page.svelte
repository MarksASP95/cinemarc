<script lang="ts">
    import { createForm } from "felte";
    import Spinner from "../../../../client/components/Spinner.svelte";
    import { toastStore, type ToastSettings } from "@skeletonlabs/skeleton";
    import { createUserWithEmailAndPassword } from "firebase/auth";
  import { uploadFile } from "../../../../client/firebase/storage.fire";
  import { goto } from "$app/navigation";
  
    export let data: { email: string, uid: string };

    const { email, uid: userId } = data;
    let formErrors: Record<string, string> = {};
    let submitting = false;
    let imageFile: File | null = null;

    const { form: inviteUserForm, setInitialValues } = createForm({
      onSubmit: (values) => {
        submitting = true;
        const requiredFields = ["username", "password"];
        const errors: Record<string, string> = {};
        requiredFields.forEach((field) => {
          if (!values[field]) errors[field] = "This field is required";
        });
        if (Object.keys(errors).length) {
          formErrors = errors;
          return;
        }
        formErrors = {};
  
        console.log(values);
        // return;
        const { username, password } = values;

        let uploadImageFile: Promise<string | null> = Promise.resolve(null);
        if (imageFile) {
            const filePath = `user_avatars/${new Date().getTime()}_${imageFile.name}`;
            uploadImageFile = uploadFile(filePath, imageFile).then(({ url }) => url);
        }
        uploadImageFile
            .then((url) => {
                return fetch("/api/register", {
                  method: "POST",
                  body: JSON.stringify({
                    userId,
                    avatarUrl: url || null,
                    username,
                    password,
                  }),
                })
            })
            .then((res) => {
                console.log(res)
              if (res.ok) {
                const t = {
                  message: 'Welcome! 👐',
                  background: 'variant-filled-success',
                };
                toastStore.trigger(t);
                goto("/login");
              } else {
                res.json().then(({ message }) => {
                    const t: ToastSettings = {
                      message: message,
                      background: 'variant-filled-error',
                    };
                    toastStore.trigger(t);
                })
              }
              
            })
            .catch((error) => {
              const t: ToastSettings = {
                  message: "An error ocurred. Try  again",
                  background: 'variant-filled-error',
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
        <span>Name</span>
        <input 
          disabled={submitting}
          name="username" 
          class="input"  
          type="text" 
          autocomplete="off"
        />
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
                Invite
              {/if}
            </button>
          </div>
      </footer>
    </form>
    
  </div>