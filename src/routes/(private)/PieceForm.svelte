<script lang="ts">
	import { Toast, modalStore, toastStore, type ToastSettings } from '@skeletonlabs/skeleton';
  import { createForm } from "felte";
  import { uploadFile } from '../../client/firebase/storage.fire';
  import type { Piece, PieceCreate, PieceEditable } from '../../models/piece.model';
  import { createPiece, updatePiece } from '../../client/pieces/piece.fire';
  import Spinner from '../../client/components/Spinner.svelte';
  import type { TMDBMovieSearchOutput, TMDBMovieSearchOutputResult, TMDBTVSearchOutput, TMDBTVSearchOutputResult } from '../../models/tmdb.model';
  import { generatePosterSmallImg } from '../../client/pieces/pieces.api';
  import { onMount } from 'svelte';

  export let parent: any;
  export let success: Function;
  export let close: Function;
  export let pieceToEdit: Piece | undefined = undefined;

  let formErrors: Record<string, string> = {};
  let submittingPiece = false;
  let imageFile: File | null;
  let searchingMovie = false;
  let foundImageUrl: string | null = null;
  let fromResultMap: Record<string, boolean> = {
    name: false,
    description: false,
    release_date: false,
    image: false,
  };

  let foundPieceConfig: {
    results: (TMDBMovieSearchOutputResult | TMDBTVSearchOutputResult)[];
    currentResultIndex: number;
    searchText: string;
    type: string;
  } | null = null;

  function updatePieceToDB(data: PieceEditable) {
    submittingPiece = true;
    
    let uploadImageFile: Promise<string | null> = Promise.resolve(null);
    if (imageFile) {
      uploadImageFile = uploadMovieImage(imageFile);
    }

    uploadImageFile
      .then((imageUrl) => {
        data.imageUrl = imageUrl || foundImageUrl || null;
        return updatePiece(pieceToEdit!.id, data);
      })
      .then((pieceId) => {
        if (data.imageUrl !== pieceToEdit?.imageUrl) {
          data.imageUrl && generatePosterSmallImg(data.imageUrl, data.name!, pieceId);
        }
        success();
      })
      .catch((err) => {
        console.log("Error updating piece", err);
        handleFormError();
      })
      .finally(() => submittingPiece = false);
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

      if (!!pieceToEdit) { // edit
        const pieceUpdateData: PieceEditable = {
          description,
          name,
          source,
          type,
        };

        updatePieceToDB(pieceUpdateData);
      } else { // create
        const pieceCr: PieceCreate = {
          description: description || null,
          imageUrl: null,
          name,
          source,
          type,
          releaseDate: release_date,
        };
  
        addPieceToDB(pieceCr)
      }


    },
    onError: (e) => {
      console.log("Error was", e)
    }
  });

  onMount(() => {
    if (!!pieceToEdit) {
      setFields("name", pieceToEdit.name)
      setFields("description", pieceToEdit.description)
      setFields("type", pieceToEdit.type)
      setFields("source", pieceToEdit.source)
      foundImageUrl = pieceToEdit.imageUrl;
      setFields("release_date", pieceToEdit.releaseDate)
    }
  });

  function handleFormError() {
    const t: ToastSettings = {
      message: 'Something went wrong 😕',
      background: 'variant-filled-error',
    };
    toastStore.trigger(t);
  }

  function uploadMovieImage(file: File) {
    const filePath = `movie_images/${new Date().getTime()}_${file.name}`;
    return uploadFile(filePath, file).then(({ url }) => url);
  }

  function addPieceToDB(pieceCr: PieceCreate) {
    submittingPiece = true;

    let uploadImageFile: Promise<string | null> = Promise.resolve(null);
    if (imageFile) {
      uploadImageFile = uploadMovieImage(imageFile);
    }

    uploadImageFile
      .then((imageUrl) => {
        pieceCr.imageUrl = imageUrl || foundImageUrl || null;
        return createPiece(pieceCr);
      })
      .then((pieceId) => {
        pieceCr.imageUrl && generatePosterSmallImg(pieceCr.imageUrl, pieceCr.name, pieceId);
        success();
      })
      .catch((err) => {
        console.log("Error creating piece", err);
        handleFormError();
      })
      .finally(() => submittingPiece = false);
  }

  function goToNextResult() {
    if (!foundPieceConfig) return;
    foundPieceConfig.currentResultIndex 
      = (foundPieceConfig.currentResultIndex + 1) % foundPieceConfig.results.length;
    setPieceFormToResult(
      foundPieceConfig.type, 
      foundPieceConfig.results[foundPieceConfig.currentResultIndex]
    );
  }

  function goToPreviousResult() {
    if (!foundPieceConfig) return;
    const newIndex = foundPieceConfig.currentResultIndex - 1;
    foundPieceConfig.currentResultIndex 
      = newIndex < 0 ? foundPieceConfig.results.length - 1 : newIndex;
    setPieceFormToResult(
      foundPieceConfig.type, 
      foundPieceConfig.results[foundPieceConfig.currentResultIndex]
    );
  }

  function setPieceFormToResult(
    type: string, 
    result: TMDBMovieSearchOutputResult | TMDBTVSearchOutputResult
  ) {
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

    fromResultMap = {
      name: true,
      description: true,
      release_date: true,
      image: true,
    };
  }
  
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
        if (data.results.length) {
          foundPieceConfig = {
            type,
            currentResultIndex: 0,
            results: data.results,
            searchText,
          }
          setPieceFormToResult(
            foundPieceConfig.type, 
            data.results[foundPieceConfig.currentResultIndex]
          );
        } else {
          foundPieceConfig = null;
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
    fromResultMap.image = false;
  }

	const cBase = 'card p-4 w-modal shadow-xl space-y-4 overflow-auto';
	const cHeader = 'text-2xl font-bold flex justify-between';
	const cForm = 'border border-surface-500 p-4 space-y-4 rounded-container-token';

  function handleFindableInputChange(e: any) {
    const { name } = e.target;
    if (!fromResultMap[name]) return;
    fromResultMap[name] = false;
  }
</script>

<Toast />
{#if $modalStore[0]}
	<div style="max-height: 94dvh" class="{cBase}">
    <header class={cHeader}>
      <span>
        {#if !pieceToEdit}
          New Piece yay!
        {:else}
          Edit "{ pieceToEdit.name }"
        {/if}
      </span>

      <button class="text-base" on:click={() => close()}>
        ❌
      </button>
    </header>

    {#if !!foundPieceConfig}
      <p class="text-center mb-1">
        Found { foundPieceConfig.results.length } results for "{foundPieceConfig.searchText}"
      </p>
      <div class="flex justify-center items-center">
        <button on:click={goToPreviousResult} type="button" class="btn-icon btn-icon-sm variant-filled bg-gradient-to-br variant-gradient-secondary-tertiary">👈</button>
        <p class="font-mono text-sm mx-2">
          {foundPieceConfig.currentResultIndex + 1}/{foundPieceConfig.results.length}
        </p>
        <button on:click={goToNextResult} type="button" class="btn-icon btn-icon-sm variant-filled bg-gradient-to-br variant-gradient-secondary-tertiary">👉</button>
      </div>
      {/if}
    <form use:pieceForm class="modal-form {cForm}">
      <!-- svelte-ignore a11y-autofocus -->
      {#if !!pieceToEdit}
        <input type="text" autofocus style="display:none" />
      {/if}
      <label class="label">
        <span>Name</span>
        <div class="flex">
          <div class="flex-1 mr-2">
            <input 
              on:input={handleFindableInputChange}
              disabled={submittingPiece}
              class:bg-gradient-to-br={fromResultMap['name']}
              class:variant-gradient-success-warning={fromResultMap['name']}
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
          on:input={handleFindableInputChange}
          disabled={submittingPiece}
          class="textarea" 
          class:bg-gradient-to-br={fromResultMap['description']}
          class:variant-gradient-success-warning={fromResultMap['description']}
          name="description" 
          id="" rows="3"
        ></textarea>
      </label>
      <label class="label">
        <span>Type</span>
        <select name="type" class="select" disabled={submittingPiece}>
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
        <select name="source" class="select" disabled={submittingPiece}>
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
        <div 
          class="p-2 rounded"
          class:variant-filled-surface={!!!fromResultMap.image}
          class:bg-gradient-to-br={!!fromResultMap.image}
          class:variant-gradient-success-warning={!!fromResultMap.image}
        >
          <img src={foundImageUrl} class="block w-full h-24 md:h-40 lg:h-48 object-cover rounded" alt="Found poster"/>
        </div>
      {/if}
      <label class="label">
        <span>Image (optional)</span>
        <input 
          disabled={submittingPiece}
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
          on:input={handleFindableInputChange}
          disabled={submittingPiece}
          accept=".png, .jpg, .jpeg"
          name="release_date" 
          class="input"  
          class:bg-gradient-to-br={fromResultMap['release_date']}
          class:variant-gradient-success-warning={fromResultMap['release_date']}
          type="date" 
        />
      </label>
      <footer class="modal-footer {parent.regionFooter} justify-between">
          <!-- <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button> -->
          <button type="button" on:click={() => close()}>close</button>
          <button disabled={submittingPiece} class="btn {parent.buttonPositive}" type="submit">
            {#if submittingPiece}
              <Spinner forButton />
            {:else}
              { pieceToEdit ? "Update" : "Create" }
            {/if}
          </button>
      </footer>
    </form>
		
	</div>
{/if}