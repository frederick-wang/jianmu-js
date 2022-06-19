<script setup lang="ts">
const App = (await import('project/App.vue')).default
</script>

<template>
  <div class="app-container">
    <el-scrollbar>
      <Suspense>
        <App />
      </Suspense>
    </el-scrollbar>
  </div>
</template>

<style lang="scss">
.app-container {
  flex: 1;
  font-size: 14px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  overflow: auto;

  :deep(.el-scrollbar__bar.is-horizontal) {
    height: 6px;
  }

  :deep(.el-scrollbar__bar.is-vertical) {
    width: 6px;
  }
}
</style>
