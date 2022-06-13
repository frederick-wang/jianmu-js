<script setup lang="ts">
import Titlebar from 'renderer/components/Titlebar.vue'
import WindowContainer from 'renderer/components/WindowContainer.vue'
</script>

<template>
  <div class="main-view">
    <Titlebar />
    <WindowContainer />
  </div>
</template>

<style lang="scss">
@import './global.scss';

.main-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
