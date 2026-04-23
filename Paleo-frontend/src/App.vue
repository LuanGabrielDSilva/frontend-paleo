<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* RESET FORÇADO PARA REMOVER BORDAS BRANCAS */
html, body, #app {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  min-height: 100vh !important;
  height: 100% !important;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

/* Remove qualquer borda ou margem que o styles.css possa adicionar */
#app {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  border: none !important;
  border-inline: none !important;
}
</style>