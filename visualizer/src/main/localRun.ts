import {BrowserWindow, shell} from "electron";
import {join, resolve} from "path";
import {is} from "@electron-toolkit/utils";
import icon from '../../resources/icon.png?asset'
import {spawn} from "node:child_process";

export async function localRun() {
    const proc = spawn(`bash`, ["-c", `bun ${join(resolve(".."), "gameServer", "src", "main.ts")}`], {
        cwd: join(resolve(".."), "gameServer"),
        stdio: "inherit"
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
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

    mainWindow.on('closed', () => {
        proc.kill();
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + "#local-run")
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'), {hash: "local-run"})
    }
}