import {BrowserWindow, shell} from "electron";
import {join} from "path";
import {is} from "@electron-toolkit/utils";
import icon from '../../resources/icon.png?asset'

export async function visualize(gameLog: Array<unknown>) {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.mjs'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        await mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + "#visualize")
    } else {
        await mainWindow.loadFile(join(__dirname, '../renderer/index.html'), {hash: "visualize"})
    }

    console.log(gameLog);
    mainWindow.webContents.send("game-log", gameLog);
}