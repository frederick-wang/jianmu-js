<script setup lang="ts">
import Titlebar from 'renderer/components/Titlebar.vue'
import AppContainer from 'renderer/components/AppContainer.vue'
import { ref } from 'vue'
import { api } from 'jianmu'

const { checkHeartbeat } = api

const isOK = ref(false)
const heartbeat = async () => {
  try {
    isOK.value = await checkHeartbeat()
  } catch (e) {
    console.error('Heartbeat check failed.')
  } finally {
    setTimeout(heartbeat, 1000)
  }
}
heartbeat()
</script>

<template>
  <div class="jianmu-main-view">
    <Titlebar />
    <Suspense>
      <AppContainer
        v-loading="!isOK"
        :element-loading-text="isOK ? '' : '正在连接 Python 端数据...'"
        element-loading-background="#fff"
        style="width: 100%"
      />
    </Suspense>
  </div>
</template>

<style lang="scss">
@import './styles/global.scss';

.jianmu-main-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
