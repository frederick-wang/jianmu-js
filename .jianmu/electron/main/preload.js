"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const electron_1 = require("electron");
const api = {
    minimize: () => electron_1.ipcRenderer.send('minimize'),
    isMaximized: () => electron_1.ipcRenderer.invoke('is-maximized'),
    toggleMaximize: () => electron_1.ipcRenderer.send('toggle-maximize'),
    close: () => electron_1.ipcRenderer.send('close'),
    toggleDevtools: () => electron_1.ipcRenderer.send('toggle-devtools'),
    reload: () => electron_1.ipcRenderer.send('reload'),
    forceReload: () => electron_1.ipcRenderer.send('force-reload'),
    quit: () => electron_1.ipcRenderer.send('quit'),
    requestPython: (method, ...args) => electron_1.ipcRenderer.invoke('request-python', method, ...args),
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('show-open-dialog', options),
    showSaveDialog: (options) => electron_1.ipcRenderer.invoke('show-save-dialog', options),
    openExternal: (url, options) => electron_1.ipcRenderer.invoke('open-external', url, options)
};
exports.api = api;
electron_1.contextBridge.exposeInMainWorld('api', api);
