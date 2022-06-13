"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const got_1 = __importDefault(require("got"));
const electron_2 = require("electron");
electron_1.Menu.setApplicationMenu(null);
let mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        frame: false,
        webPreferences: {
            preload: (0, path_1.join)(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    if (process.env.NODE_ENV === 'development') {
        const rendererPort = process.argv[2];
        mainWindow.loadURL(`http://localhost:${rendererPort}`);
    }
    else {
        mainWindow.loadFile((0, path_1.join)(electron_1.app.getAppPath(), 'ui', 'index.html'));
    }
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.on('minimize', () => {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.minimize();
});
electron_1.ipcMain.handle('is-maximized', () => mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isMaximized());
electron_1.ipcMain.on('toggle-maximize', () => {
    if (mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.maximize();
    }
});
electron_1.ipcMain.on('close', () => {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.close();
});
electron_1.ipcMain.on('toggle-devtools', () => {
    // if (process.env.DEBUGGING) {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.toggleDevTools();
    // }
});
electron_1.ipcMain.on('reload', () => {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.reload();
});
electron_1.ipcMain.on('force-reload', () => {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.reloadIgnoringCache();
});
electron_1.ipcMain.on('quit', () => {
    electron_1.app.quit();
});
electron_1.ipcMain.handle('invoke-python', (_, method, ...args) => __awaiter(void 0, void 0, void 0, function* () {
    if (!method) {
        throw new Error('No method provided');
    }
    const url = `http://localhost:19020/api/${method}`;
    try {
        const res = yield got_1.default
            .post(url, {
            json: args
        })
            .json();
        return res;
    }
    catch (e) {
        return {
            error: 1,
            message: e.message,
            data: null
        };
    }
}));
electron_1.ipcMain.handle('show-open-dialog', (_, options) => {
    if (mainWindow) {
        return electron_2.dialog.showOpenDialog(mainWindow, options);
    }
});
electron_1.ipcMain.handle('show-save-dialog', (_, options) => {
    if (mainWindow) {
        return electron_2.dialog.showSaveDialog(mainWindow, options);
    }
});
