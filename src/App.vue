<template>
  <router-view/>
</template>

<style lang="scss">
  @font-face {
    font-family: Epilogue;
    src: url(assets/fonts/epilogue.regular.ttf);
  }
  @font-face {
    font-family: EpilogueBold;
    src: url(assets/fonts/Epilogue-Bold.ttf);
  }

  #app {
    font-family: Epilogue;
    display: flex;
    height: 100vh;
    /*width: 100vw;*/
  }
  html, body {
    background-color: var(--background-color);
    height: 100vh;
    /*width: 100vw;*/
    margin: 0;
  }
</style>
