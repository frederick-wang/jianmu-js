<script setup lang="ts">
import Window from 'project/Window.vue'
</script>

<template>
  <div class="window-container">
    <el-scrollbar>
      <Suspense>
        <Window />
      </Suspense>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.window-container {
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
