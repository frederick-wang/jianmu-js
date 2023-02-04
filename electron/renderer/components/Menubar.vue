<script setup lang="ts">
import hotkeys from 'hotkeys-js'
import { api } from 'jianmu'
import { ref } from 'vue'
import { isDev } from '../tools'

const {
  isMenuActive,
  forceReload,
  toggleDevtools,
  reload,
  quit,
  openExternal,
  os
} = api

const isMac = ref(false)
os.platform().then((platform) => (isMac.value = platform === 'darwin'))

hotkeys('Ctrl+W, Command+W', (e) => {
  e.preventDefault()
  quit()
})

if (isDev) {
  hotkeys('Ctrl+Shift+R, Command+Shift+R', forceReload)
  hotkeys('Ctrl+R, Command+R', reload)
  hotkeys('Ctrl+Shift+I, Command+Option+I', toggleDevtools)
}

const openPyPIWebsite = () => {
  openExternal('https://pypi.org/project/jianmu/')
}
</script>

<template>
  <div class="menubar">
    <div class="menubar-menu-button">
      <div class="menubar-menu-title">文件(F)</div>
      <div class="action-bar" :class="{ active: isMenuActive }">
        <a class="action-item" @click="quit()">
          <div class="action-label">退出</div>
          <div class="keybinding">{{ isMac ? 'Command+W' : 'Ctrl+W' }}</div>
        </a>
      </div>
    </div>
    <div v-if="isDev" class="menubar-menu-button">
      <div class="menubar-menu-title">开发(D)</div>
      <div class="action-bar" :class="{ active: isMenuActive }">
        <a class="action-item" @click="reload()">
          <div class="action-label">刷新</div>
          <div class="keybinding">{{ isMac ? 'Command+R' : 'Ctrl+R' }}</div>
        </a>
        <a class="action-item" @click="forceReload()">
          <div class="action-label">强制刷新</div>
          <div class="keybinding">
            {{ isMac ? 'Command+Shift+R' : 'Ctrl+Shift+R' }}
          </div>
        </a>
        <a class="action-item" @click="toggleDevtools()">
          <div class="action-label">开发者工具</div>
          <div class="keybinding">
            {{ isMac ? 'Command+Option+I' : 'Ctrl+Shift+I' }}
          </div>
        </a>
      </div>
    </div>
    <div class="menubar-menu-button">
      <div class="menubar-menu-title">帮助(H)</div>
      <div class="action-bar" :class="{ active: isMenuActive }">
        <a class="action-item" @click="openPyPIWebsite()">
          <div class="action-label">帮助文档</div>
          <div class="keybinding"></div>
        </a>
        <a class="action-item" @click="openPyPIWebsite()">
          <div class="action-label">关于</div>
          <div class="keybinding"></div>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menubar {
  height: 30px;
  z-index: 2500;
  display: flex;
  flex-shrink: 1;
  box-sizing: border-box;
  height: 30px;
  flex-wrap: wrap;

  .menubar-menu-button {
    color: #333333;
    align-items: center;
    box-sizing: border-box;
    cursor: default;
    -webkit-app-region: no-drag;
    zoom: 1;
    white-space: nowrap;
    outline: 0;
    position: relative;

    .menubar-menu-title {
      padding: 0 8px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    .action-bar {
      position: absolute;
      top: 30px;
      left: 0;
      display: none;
      z-index: 2000;
      box-shadow: rgb(0 0 0 / 16%) 0px 2px 4px;
      background-color: #ffffff;
      padding: 0.5em 0;
      white-space: nowrap;

      .action-item {
        color: rgb(97, 97, 97);
        border: thin solid transparent;
        display: flex;
        cursor: pointer;
        height: 1.8em;
        align-items: center;
        position: relative;
        text-decoration: none;
        margin: 2px 0;
        justify-content: space-between;

        &:hover {
          background-color: rgb(0, 96, 192);
          color: #ffffff;
        }

        .action-label {
          padding: 0 2em;
          line-height: 1;
        }

        .keybinding {
          padding: 0 2em;
          line-height: 1;
          text-align: right;
        }
      }
    }

    &:hover .action-bar.active {
      display: block;
    }
  }
}
</style>
