import {BrowserWindow, shell, WebContents, dialog} from "electron";
import {join, resolve} from "path";
import {is} from "@electron-toolkit/utils";
import icon from '../../resources/icon.png?asset'
import {ChildProcess, spawn} from "node:child_process";
import Backendium from "backendium";
import {array, int, object, optional, string} from "parsium";
import {visualize} from "./visualize";
import {createRootWindow} from "./index";
import * as fs from "node:fs";
import cryptoRandomString from 'crypto-random-string';

async function startServer(webContents: WebContents) {
    let proc: ChildProcess | null = null;
    const app = new Backendium({port: 8889, logging: {replaceConsoleLog: false}});
    const gameLog: Array<unknown> = [];

    app.post("/connection-idle", {
        bodyValidator: array(int())
    }, async (request, response) => {
        webContents.send("message", request.body.map(player => `Player ${player}: connection timed out`).join('\n'));
        webContents.send("game-ended", undefined);
        proc?.kill();
        response.end();
    });

    app.post("/init-idle/:player", {
        paramsValidator: object({player: int()})
    }, async (request, response) => {
        webContents.send("message", `Player ${request.params.player}: init WebSocket response timed out`);
        webContents.send("game-ended", undefined);
        proc?.kill();
        response.end();
    });

    app.post("/init-bad-request/:player", {
        paramsValidator: object({player: int()}),
        bodyValidator: object({message: string()})
    }, async (request, response) => {
        webContents.send("message", `Player ${request.params.player}: ${request.body.message}`);
        webContents.send("game-ended", undefined);
        proc?.kill();
        proc?.kill();
        response.end();
    });

    app.post("/action-idle/:player", {
        paramsValidator: object({player: int()})
    }, async (request, response) => {
        gameLog.push({idle: true, correct: false, player: request.params.player});
        webContents.send("message", `Player ${request.params.player}: WebSocket response timed out`);
        webContents.send("game-ended", (request.params.player + 1) % 2);
        proc?.kill();
        response.end();
    });

    app.post("/action-bad-request/:player", {
        paramsValidator: object({player: int()}),
        bodyValidator: object({message: string()})
    }, async (request, response) => {
        gameLog.push({correct: false, ...request.body});
        webContents.send("message", `Player ${request.params.player}: ${request.body.message}`);
        webContents.send("game-ended", (request.params.player + 1) % 2);
        proc?.kill();
        response.end();
    });

    app.post("/player-ready/:player", {
        paramsValidator: object({player: int()})
    }, async (request, response) => {
        webContents.send("player-ready", request.params.player);
        response.end();
    });

    app.post("/game-started", {}, async (request, response) => {
        webContents.send("game-started");
        response.end();
    });

    app.post("/action", {
        bodyValidator: object({})
    }, async (request, response) => {
        gameLog.push({correct: true, ...request.body});
        response.end();
    });

    app.post("/turn-ended/:turn", {
        paramsValidator: object({turn: int()})
    }, async (request, response) => {
        webContents.send("turn-ended", request.params.turn);
        response.end();
    });

    app.post("/game-ended", {
        bodyValidator: object({winner: optional(int())})
    }, async (request, response) => {
        webContents.send("game-ended", request.body.winner);
        proc?.kill();
        response.end();
    });

    const server = await app.startAsync();

    proc = spawn(`bash`, ["-c", `/home/sizoff/.bun/bin/bun ${join(resolve(".."), "gameServer", "src", "main.ts")}`], {
        cwd: join(resolve(".."), "gameServer"),
        stdio: "inherit",
        env: {
            CONNECTION_IDLE_TIME: "1000",
            OUTPUT: "http://localhost:8889"
        }
    });

    return [proc, server, () => gameLog] as const;
}

export async function localRun() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.mjs'),
            sandbox: false
        },
        resizable: false,
        maximizable: false
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    });

    let [proc, server, gameLog] = await startServer(mainWindow.webContents);

    mainWindow.webContents.ipc.handle("back", async () => {
        createRootWindow();
        mainWindow.close();
    });

    mainWindow.webContents.ipc.handle("restart", async () => {
        proc?.kill();
        server.close();
        const [proc2, server2, gameLog2] = await startServer(mainWindow.webContents);
        proc = proc2;
        server = server2;
        gameLog = gameLog2;
    });

    mainWindow.webContents.ipc.handle("save", async () => {
        const file = (await dialog.showSaveDialog(mainWindow, {
            filters: [
                {name: 'Game log', extensions: ["log"]},
                {name: 'All files', extensions: ['*']}
            ],
            defaultPath: `game-${cryptoRandomString({length: 10})}.log`,
            title: "Save game log"
        })).filePath;
        if (file) await fs.promises.writeFile(file, JSON.stringify(gameLog(), null, 4), {encoding: "utf8"});
    });

    mainWindow.webContents.ipc.handle("visualize", async () => {
        await visualize(gameLog());
    });

    mainWindow.on('closed', () => {
        proc?.kill();
        server.close();
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + "#local-run")
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'), {hash: "local-run"})
    }
}