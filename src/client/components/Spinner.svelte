<script lang="ts">
  export let forButton = false;
</script>

<style lang="scss">
  @keyframes round-spinner-animation {
    100% {
      transform: rotate(360deg);
    }
  }

  .round-spinner {
    border: 0.25em solid currentColor;
    display: inline-block;
    width: 2rem;
    height: 2rem;
    vertical-align: -0.125em;
    border-radius: 50%;
    animation: 0.75s linear infinite round-spinner-animation;

    &-btn {
      width: 24px;
      height: 24px;
      border-width: 0.2em;
    }

    border-right-color: transparent !important;
  }
</style>

<span class={`round-spinner ${forButton ? 'round-spinner-btn' : ''}`}></span>