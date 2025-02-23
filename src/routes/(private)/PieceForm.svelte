<script lang="ts">
  import {
    Toast,
    modalStore,
    toastStore,
    type ToastSettings,
  } from "@skeletonlabs/skeleton";
  import { createForm, getValue } from "felte";
  import { deleteField } from "firebase/firestore";
  import { onMount } from "svelte";
  import type { Nullable } from "vitest";
  import { CinemarcAPI } from "../../client/cinemarc-api/cinemarc-api";
  import Spinner from "../../client/components/Spinner.svelte";
  import { uploadFile } from "../../client/firebase/storage.fire";
  import { createPiece, updatePiece } from "../../client/pieces/piece.fire";
  import { piecePlaceholderImagesURLs } from "../../constants/piece.const";
  import type {
    Piece,
    PieceCreate,
    PieceEditable,
    PieceType,
  } from "../../models/piece.model";
  import type {
    TMDBMovieSearchOutputResult,
    TMDBTVSearchOutputResult,
  } from "../../models/tmdb.model";
  import { type TagDocument } from "../../models/tag.model";
  import { buildFixedValueRecord, buildRecord } from "../../utils/object.util";

  export let parent: any;
  export let success: Function;
  export let close: Function;
  export let pieceToEdit: Piece | undefined = undefined;
  export let tags: TagDocument[];

  let tagsMap: Record<string, TagDocument> = buildRecord(tags, "id");
  let selectedTagsMap: Record<string, boolean> = buildFixedValueRecord(
    tags,
    "id",
    false
  );

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
    tmdbId: false,
  };

  $: tagsIdsValue = ($data.tagsIds as string[]) || [];

  let loadingTMDBPoster = false;
  let foundPieceConfig: {
    results: (TMDBMovieSearchOutputResult | TMDBTVSearchOutputResult)[];
    currentResultIndex: number;
    searchText: string;
    type: string;
  } | null = null;

  let formDisabled = false;
  $: formDisabled = submittingPiece || searchingMovie;

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
          data.imageUrl &&
            CinemarcAPI.pieces.uploadPosterThumbnail(
              data.imageUrl,
              data.name!,
              pieceId
            );
        }
        success();
      })
      .catch((err) => {
        console.log("Error updating piece", err);
        handleFormError();
      })
      .finally(() => (submittingPiece = false));
  }

  const {
    form: pieceForm,
    data,
    setFields,
    addField,
    unsetField,
    // setInitialValues,
  } = createForm({
    onSubmit: (values) => {
      // console.log(values);
      
      const {
        name,
        description,
        source,
        type,
        author,
        release_date = null,
        tmdbId = null,
        associate_with_result = true,
        tagsIds = [],
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

      const releaseYear: Nullable<number> = release_date
        ? parseInt((release_date as string).split("-")[0])
        : null;

      if (!!pieceToEdit) {
        // edit
        const pieceUpdateData: PieceEditable = {
          description,
          name,
          source,
          type,
          tmdbId: associate_with_result ? tmdbId : null,
          releaseDate: release_date || null,
          releaseYear,
          tagsIds,
        };

        if (type === <PieceType>"book" && author.trim()) {
          pieceUpdateData.author = author;
        } else {
          pieceUpdateData.author = deleteField() as any;
        }

        updatePieceToDB(pieceUpdateData);
      } else {
        // create
        const pieceCr: PieceCreate = {
          description: description || null,
          imageUrl: null,
          name,
          source,
          type,
          releaseDate: release_date,
          tmdbId: associate_with_result ? tmdbId : null,
          releaseYear,
          tagsIds,
        };

        if (type === <PieceType>"book" && (author || "").trim()) {
          pieceCr.author = author;
        }

        addPieceToDB(pieceCr);
      }
    },
    onError: (e) => {
      console.log("Error was", e);
    },
  });

  // setInitialValues({
  //   source: "unknown",
  // });

  onMount(() => {
    if (!!pieceToEdit) {
      setFields("name", pieceToEdit.name);
      setFields("description", pieceToEdit.description);
      setFields("type", pieceToEdit.type);
      setFields("source", pieceToEdit.source);
      setFields("author", pieceToEdit.author || "");
      foundImageUrl = pieceToEdit.imageUrl;
      setFields("release_date", pieceToEdit.releaseDate);
      setFields("tmdbId", pieceToEdit.tmdbId || null);
      setFields("associate_with_result", !!pieceToEdit.tmdbId);
      setFields("tagsIds", !!pieceToEdit.tagsIds);
    } else {
      setFields("associate_with_result", true);
    }
  });

  function handleFormError() {
    const t: ToastSettings = {
      message: "Something went wrong 😕",
      background: "variant-filled-error",
      hideDismiss: true,
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
        pieceCr.imageUrl =
          imageUrl || foundImageUrl || piecePlaceholderImagesURLs[pieceCr.type];
        return createPiece(pieceCr);
      })
      .then((pieceId) => {
        pieceCr.imageUrl &&
          CinemarcAPI.pieces.uploadPosterThumbnail(
            pieceCr.imageUrl,
            pieceCr.name,
            pieceId
          );
        success();
      })
      .catch((err) => {
        console.log("Error creating piece", err);
        handleFormError();
      })
      .finally(() => (submittingPiece = false));
  }

  function goToNextResult() {
    if (!foundPieceConfig) return;
    foundPieceConfig.currentResultIndex =
      (foundPieceConfig.currentResultIndex + 1) %
      foundPieceConfig.results.length;
    setPieceFormToResult(
      foundPieceConfig.type,
      foundPieceConfig.results[foundPieceConfig.currentResultIndex]
    );
  }

  function goToPreviousResult() {
    if (!foundPieceConfig) return;
    const newIndex = foundPieceConfig.currentResultIndex - 1;
    foundPieceConfig.currentResultIndex =
      newIndex < 0 ? foundPieceConfig.results.length - 1 : newIndex;
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
      type === "movie"
        ? (result as TMDBMovieSearchOutputResult).original_title
        : (result as TMDBTVSearchOutputResult).name,
      true
    );
    setFields("description", result.overview, true);
    setFields("type", $data.type || "movie", true);
    setFields("tmdbId", result.id);
    setFields("associate_with_result", true);
    setFields("tags", []);

    const releaseDateStr =
      (result as TMDBMovieSearchOutputResult).release_date ||
      (result as TMDBTVSearchOutputResult).first_air_date ||
      null;

    setFields("release_date", releaseDateStr);

    foundImageUrl = `https://image.tmdb.org/t/p/original${result.poster_path}`;
    imageFile = null;

    const img = new Image();
    img.src = foundImageUrl;
    loadingTMDBPoster = true;

    img.onload = () => {
      loadingTMDBPoster = false;
    };

    fromResultMap = {
      name: true,
      description: true,
      release_date: true,
      image: true,
      tmdbId: true,
    };
  }

  function findMovieOnTMDB() {
    searchingMovie = true;
    const searchText = $data.name;

    let type: string;
    switch ($data.type) {
      case "movie":
        type = "movie";
        break;
      case "series":
        type = "tv";
        break;
      default:
        type = "movie";
    }

    CinemarcAPI.pieces
      .searchMovieInTMDB(searchText, type)
      .then((data) => {
        if (data.results.length) {
          foundPieceConfig = {
            type,
            currentResultIndex: 0,
            results: data.results,
            searchText,
          };
          setPieceFormToResult(
            foundPieceConfig.type,
            data.results[foundPieceConfig.currentResultIndex]
          );
        } else {
          foundPieceConfig = null;
          const t: ToastSettings = {
            message: "Couldn't find anything 👉👈",
            background: "variant-filled-warning",
            hideDismiss: true,
          };
          toastStore.trigger(t);
        }
      })
      .finally(() => (searchingMovie = false));
  }

  function handleImageInputChange(e: any) {
    imageFile = e.target.files[0] || null;
    foundImageUrl = null;
    fromResultMap.image = false;
  }

  function addTag(tagId: string) {
    addField(`tagsIds.${tagsIdsValue.length}`, tagId);
    selectedTagsMap[tagId] = true;
  }

  function removeTag(tagId: string, tagIdx: number) {
    unsetField(`tagsIds.${tagIdx}`);
    selectedTagsMap[tagId] = false;
  }

  const cBase = "card p-4 w-modal shadow-xl space-y-4 overflow-auto";
  const cHeader = "text-2xl font-bold flex justify-between";
  const cForm =
    "border border-surface-500 p-4 space-y-4 rounded-container-token";

  function handleFindableInputChange(e: any) {
    const { name } = e.target;
    if (!fromResultMap[name]) return;
    fromResultMap[name] = false;
  }
</script>

<Toast />
{#if $modalStore[0]}
  <div style="max-height: 94dvh" class={cBase}>
    <header class={cHeader}>
      <span>
        {#if !pieceToEdit}
          New Piece yay!
        {:else}
          Edit "{pieceToEdit.name}"
        {/if}
      </span>

      <button class="text-base" on:click={() => close()}> ❌ </button>
    </header>

    {#if !!foundPieceConfig}
      <p class="text-center mb-1">
        Found {foundPieceConfig.results.length} results for "{foundPieceConfig.searchText}"
      </p>
      <div class="flex justify-center items-center">
        <button
          on:click={goToPreviousResult}
          type="button"
          class="btn-icon btn-icon-sm variant-filled bg-gradient-to-br variant-gradient-secondary-tertiary"
          >👈</button
        >
        <p class="font-mono text-sm mx-2">
          {foundPieceConfig.currentResultIndex + 1}/{foundPieceConfig.results
            .length}
        </p>
        <button
          on:click={goToNextResult}
          type="button"
          class="btn-icon btn-icon-sm variant-filled bg-gradient-to-br variant-gradient-secondary-tertiary"
          >👉</button
        >
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
              disabled={formDisabled}
              class:bg-gradient-to-br={fromResultMap["name"]}
              class:variant-gradient-success-warning={fromResultMap["name"]}
              name="name"
              class="input"
              type="text"
            />
            {#if formErrors.name}
              <small class="text-error-500">{formErrors.name}</small>
            {/if}
          </div>
          <button
            disabled={formDisabled}
            on:click={findMovieOnTMDB}
            type="button"
            class="btn bg-gradient-to-br variant-gradient-success-warning w-32 h-fit"
          >
            Find &nbsp;
            {#if searchingMovie}
              <Spinner forButton />
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                ><path
                  d="M4.908 2.081l-2.828 2.828 19.092 19.091 2.828-2.828-19.092-19.091zm17.678 19.091l-1.414 1.414-14.143-14.142 1.414-1.414 14.143 14.142zm-13.826-18.573c1.232.376 2.197 1.341 2.572 2.573.377-1.232 1.342-2.197 2.573-2.573-1.231-.376-2.196-1.34-2.573-2.573-.375 1.232-1.34 2.197-2.572 2.573zm-5.348 6.954c-.498 1.635-1.777 2.914-3.412 3.413 1.635.499 2.914 1.777 3.412 3.411.499-1.634 1.778-2.913 3.412-3.411-1.634-.5-2.913-1.778-3.412-3.413zm9.553-3.165c.872.266 1.553.948 1.819 1.82.266-.872.948-1.554 1.819-1.82-.871-.266-1.553-.948-1.819-1.82-.266.871-.948 1.554-1.819 1.82zm4.426-6.388c-.303.994-1.082 1.772-2.075 2.076.995.304 1.772 1.082 2.077 2.077.303-.994 1.082-1.772 2.074-2.077-.992-.303-1.772-1.082-2.076-2.076z"
                /></svg
              >
            {/if}
          </button>
        </div>
      </label>
      <label class="label">
        <span>Description (optional)</span>
        <textarea
          on:input={handleFindableInputChange}
          disabled={formDisabled}
          class="textarea"
          class:bg-gradient-to-br={fromResultMap["description"]}
          class:variant-gradient-success-warning={fromResultMap["description"]}
          name="description"
          id=""
          rows="3"
        ></textarea>
      </label>
      <label class="label">
        <span>Type</span>
        <select name="type" class="select" disabled={formDisabled}>
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

      {#if $data.type === "book"}
        <label class="label">
          <span>Author</span>
          <input
            disabled={formDisabled}
            type="text"
            class="input"
            name="author"
            class:bg-gradient-to-br={fromResultMap["author"]}
            class:variant-gradient-success-warning={fromResultMap["author"]}
          />
        </label>
      {/if}

      <label class="label">
        <span>Source</span>
        <select name="source" class="select" disabled={formDisabled}>
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

      <div class:opacity-50={formDisabled}>
        {#if foundImageUrl}
          <a
            on:click={(e) => formDisabled && e.preventDefault()}
            href={foundImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded block"
            class:variant-filled-surface={!!!fromResultMap.image}
            class:bg-gradient-to-br={!!fromResultMap.image}
            class:variant-gradient-success-warning={!!fromResultMap.image}
          >
            {#if loadingTMDBPoster}
              <div
                class="h-24 md:h-40 lg:h-48 flex justify-center items-center"
              >
                <Spinner />
              </div>
            {:else}
              <img
                src={foundImageUrl}
                class="block w-full h-24 md:h-40 lg:h-48 object-cover rounded"
                alt="Found poster"
              />
            {/if}
          </a>
        {/if}
      </div>
      <label class="label">
        <span>Image (optional)</span>
        <input
          disabled={formDisabled}
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
          disabled={formDisabled}
          accept=".png, .jpg, .jpeg"
          name="release_date"
          class="input"
          class:bg-gradient-to-br={fromResultMap["release_date"]}
          class:variant-gradient-success-warning={fromResultMap["release_date"]}
          type="date"
        />
      </label>

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">
        <span>Tags (optional)</span>
        <div class="alert variant-ghost">
          <div class="alert-message">
            <div class="flex items-center overflow-auto pb-2 status-scroll">
              {#if tags.length}
                {#each tags as tag}
                  <div
                    on:click={() => addTag(tag.id)}
                    class={`mr-2 badge cursor-pointer ${tag.class}`}
                    class:hidden={!!selectedTagsMap[tag.id]}
                  >
                    {tag.text}
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </div>
      </label>
      <div class="flex items-center overflow-auto pb-2 status-scroll">
        {#if tagsIdsValue.length}
          {#each tagsIdsValue as tagId, i}
            <div
              on:click={() => removeTag(tagId, i)}
              class={`mr-2 badge cursor-pointer ${tagsMap[tagId].class}`}
            >
              {tagsMap[tagId].text}
            </div>
          {/each}
        {/if}
      </div>
      {#if !!$data.tmdbId}
        <label class="flex items-center space-x-2">
          <input
            disabled={formDisabled}
            name="associate_with_result"
            type="checkbox"
            class="checkbox"
          />
          <p>Associate this piece with latest set result from TMDB</p>
        </label>
      {/if}
      <footer class="modal-footer {parent.regionFooter} justify-between">
        <!-- <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button> -->
        <button disabled={formDisabled} type="button" on:click={() => close()}
          >close</button
        >
        <button
          disabled={formDisabled}
          class="btn {parent.buttonPositive}"
          type="submit"
        >
          {#if submittingPiece}
            <Spinner forButton />
          {:else}
            {pieceToEdit ? "Update" : "Create"}
          {/if}
        </button>
      </footer>
    </form>
  </div>
{/if}
