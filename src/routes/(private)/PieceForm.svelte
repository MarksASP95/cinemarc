<script lang="ts">
	import { Toast, modalStore, toastStore, type ToastSettings } from '@skeletonlabs/skeleton';
  import { createForm } from "felte";
  import { uploadFile } from '../../client/firebase/storage.fire';
  import type { PieceCreate } from '../../models/piece.model';
  import { createPiece } from '../../client/pieces/piece.fire';
  import Spinner from '../../client/components/Spinner.svelte';
  import type { TMDBMovieSearchOutput, TMDBMovieSearchOutputResult, TMDBTVSearchOutput, TMDBTVSearchOutputResult } from '../../models/tmdb.model';

  export let parent: any;
  export let success: Function;

  let formErrors: Record<string, string> = {};
  let creatingPiece = false;
  let imageFile: File | null;
  let searchingMovie = false;
  let foundImageUrl: string | null = null;

  function handleFormError() {
    const t: ToastSettings = {
      message: 'Something went wrong 😕',
      background: 'variant-filled-error',
    };
    toastStore.trigger(t);
  }

  function addPieceToDB(pieceCr: PieceCreate) {
    creatingPiece = true;

    let uploadImageFile: Promise<string | null> = Promise.resolve(null);
    if (imageFile) {
      const filePath = `movie_images/${new Date().getTime()}_${imageFile.name}`;
      uploadImageFile = uploadFile(filePath, imageFile).then(({ url }) => url);
    }

    uploadImageFile
      .then((imageUrl) => {
        pieceCr.imageUrl = imageUrl || foundImageUrl || null;
        return createPiece(pieceCr);
      })
      .then((pieceId) => {
        fetch("/api/upload-poster-thumbnail", {
          method: "POST",
          body: JSON.stringify({
            imgUrl: pieceCr.imageUrl,
            fileName: pieceCr.name,
            pieceId,
          }),
        });
        success();
      })
      .catch((err) => {
        console.log("Error creating piece", err);
        handleFormError();
      })
      .finally(() => creatingPiece = false);
  }

	const { form: pieceForm, data, setFields } = createForm({
    onSubmit: (values) => {
      const {
        name,
        description, 
        source,
        type,
        release_date = null,
      } = values;
    
      const requiredFields = ["name", "source", "type"];
  
      const errors: Record<string, string> = {};
      requiredFields.forEach((field) => {
        if (!values[field]) errors[field] = "This field is required";
      });
  
      if (Object.keys(errors).length) {
        formErrors = errors;
        return;
      }
      formErrors = {};

      const pieceCr: PieceCreate = {
        description: description || null,
        imageUrl: null,
        name,
        source,
        type,
        releaseDate: release_date,
      };

      addPieceToDB(pieceCr)

    },
    onError: (e) => {
      console.log("Error was", e)
    }
  })
  
  function findMovieOnTMDB() {
    searchingMovie = true;
    const searchText = $data.name;

    let type: string;
    switch($data.type) {
      case "movie":
        type = "movie";
        break;
      case "series":
        type = "tv";
        break;
      default: type = "movie";
    }

    fetch("/api/search-movie-tmdb", {
      method: "POST",
      body: JSON.stringify({ searchText, type })
    })
      .then((res) => res.json())
      .then(({ data }: { data: TMDBMovieSearchOutput | TMDBTVSearchOutput }) => {
        console.log(data)
        let result = data.results[0];
        if (result) {
          setFields(
            "name", 
            type === "movie" ? 
              (result as TMDBMovieSearchOutputResult).original_title 
              :
              (result as TMDBTVSearchOutputResult).name,
            true
          );
          setFields("description", result.overview, true);
          setFields("type", $data.type || "movie", true);

          const releaseDateStr = 
            (result as TMDBMovieSearchOutputResult).release_date ||
            (result as TMDBTVSearchOutputResult).first_air_date || 
            null;
          
          setFields("release_date", releaseDateStr);

          foundImageUrl = `https://image.tmdb.org/t/p/original${result.poster_path}`;
          imageFile = null;
        } else {
          const t: ToastSettings = {
            message: 'Couldn\'t find anything 👉👈',
            background: 'variant-filled-warning',
          };
          toastStore.trigger(t);
        }
      });
  }

  function handleImageInputChange(e: any) {
    imageFile = e.target.files[0] || null;
    foundImageUrl = null;
  }

	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';
</script>

<Toast />
{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
    <header class={cHeader}>New Piece yay!</header>
    <form use:pieceForm class="modal-form {cForm}">
      <label class="label">
        <span>Name</span>
        <div class="flex">
          <div class="flex-1 mr-2">
            <input 
              disabled={creatingPiece}
              name="name" 
              class="input"  
              type="text" 
            />
            {#if formErrors.name}
              <small class="text-error-500">{formErrors.name}</small>
            {/if}
          </div>
          <button on:click={findMovieOnTMDB} type="button" class="btn bg-gradient-to-br variant-gradient-success-warning w-32">
            Find &nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4.908 2.081l-2.828 2.828 19.092 19.091 2.828-2.828-19.092-19.091zm17.678 19.091l-1.414 1.414-14.143-14.142 1.414-1.414 14.143 14.142zm-13.826-18.573c1.232.376 2.197 1.341 2.572 2.573.377-1.232 1.342-2.197 2.573-2.573-1.231-.376-2.196-1.34-2.573-2.573-.375 1.232-1.34 2.197-2.572 2.573zm-5.348 6.954c-.498 1.635-1.777 2.914-3.412 3.413 1.635.499 2.914 1.777 3.412 3.411.499-1.634 1.778-2.913 3.412-3.411-1.634-.5-2.913-1.778-3.412-3.413zm9.553-3.165c.872.266 1.553.948 1.819 1.82.266-.872.948-1.554 1.819-1.82-.871-.266-1.553-.948-1.819-1.82-.266.871-.948 1.554-1.819 1.82zm4.426-6.388c-.303.994-1.082 1.772-2.075 2.076.995.304 1.772 1.082 2.077 2.077.303-.994 1.082-1.772 2.074-2.077-.992-.303-1.772-1.082-2.076-2.076z"/></svg>
          </button>
        </div>
      </label>
      <label class="label">
        <span>Description (optional)</span>
        <textarea 
          disabled={creatingPiece}
          class="textarea" 
          name="description" 
          id="" rows="3"
        ></textarea>
      </label>
      <label class="label">
        <span>Type</span>
        <select name="type" class="select" disabled={creatingPiece}>
          <option value="" selected disabled>Select a type</option>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
          <option value="podcast">Podcast</option>
          <option value="documentary">Documentary</option>
          <option value="video">Video</option>
          <option value="book">Book</option>
          <option value="music">Music</option>
        </select>
        {#if formErrors.type}
          <small class="text-error-500">{formErrors.type}</small>
        {/if}
      </label>
      <label class="label">
        <span>Source</span>
        <select name="source" class="select" disabled={creatingPiece}>
          <option value="" selected disabled>Select a source</option>
          <option value="netflix">Netflix</option>
          <option value="youtube">Youtube</option>
          <option value="spotify">Spotify</option>
          <option value="torrent_file">Torrent file</option>
          <option value="downloaded">Downloaded</option>
          <option value="hbo_max">HBO Max</option>
          <option value="mubi">Mubi</option>
          <option value="prime_video">Prime Video</option>
          <option value="theater">Theaters</option>
          <option value="web">Web</option>
          <option value="physical">Physical</option>
          <option value="unknown">Unknown</option>
        </select>
        {#if formErrors.source}
          <small class="text-error-500">{formErrors.source}</small>
        {/if}
      </label>
      {#if foundImageUrl}
        <img src={foundImageUrl} class="block w-full h-24 md:h-40 lg:h-48 object-cover" alt="Found poster"/>
      {/if}
      <label class="label">
        <span>Image (optional)</span>
        <input 
          disabled={creatingPiece}
          accept=".png, .jpg, .jpeg"
          on:change={handleImageInputChange}
          name="image" 
          class="input"  
          type="file" 
        />
      </label>
      <label class="label">
        <span>Release date (optional)</span>
        <input 
          disabled={creatingPiece}
          accept=".png, .jpg, .jpeg"
          name="release_date" 
          class="input"  
          type="date" 
        />
      </label>
      <footer class="modal-footer {parent.regionFooter}">
          <!-- <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button> -->
          <button disabled={creatingPiece} class="btn {parent.buttonPositive}" type="submit">
            {#if creatingPiece}
              <Spinner forButton />
            {:else}
              Create
            {/if}
          </button>
      </footer>
    </form>
		
	</div>
{/if}