<script setup lang="ts">
import Titlebar from 'renderer/components/Titlebar.vue'
import AppContainer from 'renderer/components/AppContainer.vue'
</script>

<template>
  <div class="jianmu-main-view">
    <Titlebar />
    <Suspense>
      <AppContainer />
    </Suspense>
  </div>
</template>

<style lang="scss">
@import './global.scss';

.jianmu-main-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
