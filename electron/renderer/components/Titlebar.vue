<script setup lang="ts">
import Menubar from 'renderer/components/Menubar.vue'
import { api } from 'jianmu'

const { minimize, toggleMaximize, close, isMaximized } = api
</script>

<template>
  <div class="titlebar">
    <div class="titlebar-container">
      <div class="titlebar-drag-region"></div>
      <div class="window-appicon">
        <fa icon="tree" />
      </div>
      <Menubar />
      <div class="window-title">Jianmu</div>
      <div class="window-controls-container">
        <div class="window-icon window-minimize" @click="minimize()">
          <fa :icon="['far', 'window-minimize']" />
        </div>
        <div class="window-icon window-max-restore" @click="toggleMaximize()">
          <fa
            :icon="['far', isMaximized ? 'window-restore' : 'window-maximize']"
          />
        </div>
        <div class="window-icon window-close" @click="close()">
          <fa :icon="['fas', 'xmark']" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.titlebar {
  background-color: rgb(229, 229, 229);
  color: rgba(51, 51, 51);
  width: 100%;
  height: 30px;

  &.inactive {
    color: rgba(51, 51, 51, 0.6);
  }

  .titlebar-container {
    position: relative;
    height: 100%;
    width: 100%;
    padding: 0;
    line-height: 30px;
    justify-content: left;
    display: flex;
    user-select: none;
    flex-shrink: 0;
    align-items: center;
    overflow: visible;

    .titlebar-drag-region {
      top: 0;
      left: 0;
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-app-region: drag;
    }

    .window-appicon {
      width: 35px;
      height: 100%;
      position: relative;
      z-index: 3000;
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
    }

    .window-title {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 0px);
      cursor: default;
      flex: 0 1 auto;
      font-size: 12px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin-left: auto;
      margin-right: auto;
    }

    .window-controls-container {
      min-width: 138px;
      display: flex;
      flex-grow: 0;
      flex-shrink: 0;
      text-align: center;
      position: relative;
      z-index: 3000;
      -webkit-app-region: no-drag;
      height: 100%;
      margin-left: auto;

      .window-icon {
        display: inline-block;
        line-height: 30px;
        height: 100%;
        width: 46px;
        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
