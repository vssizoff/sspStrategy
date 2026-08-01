import * as ws from "ws";
import {createServer} from "node:http";
import Player from "./player.js";
import State from "./state.js";
import { loadCharacters } from "./characters.js";
import "./outputApi.js";
import { outputApi } from "./outputApi.js";

const CONNECTION_IDLE_TIME = Number(process.env.CONNECTION_IDLE_TIME ?? "10000");
const PLAYERS_COUNT = 2;
let players: Array<Player> = [];
let gameStarted = false;
let state: State | null = null;

async function start() {
    if (players.length < PLAYERS_COUNT || gameStarted) return;
    gameStarted = true;
    console.log("Game started");
    await Promise.all(players.map(player => player.awaitReady()));
    state = new State(players.toSorted((a, b) => a.id - b.id));
    while (state.checkVictory() === -1 && state.turnNumber < 500) {
        await state.turn();
    }
    outputApi.end(state.checkVictory());
}

const httpServer = createServer(async (req, res) => {
    if (req.url?.startsWith("/state/")) {
        const id = parseInt(req.url.slice(7));
        if (isNaN(id) || id < 0 || id > 1 || !state) {
            res.statusCode = 400;
            res.end();
            return;
        }
        if (req.method === "POST") {
            await players[id]?.onAction(req, state);
        }
        res.write(JSON.stringify(players[id]?.getStateObject(state)));
    }
    res.end();
});
const wss = new ws.WebSocketServer({
    server: httpServer
});

wss.on("connection", (ws, request) => {
    if (request.url?.startsWith("/player/")) {
        const id = parseInt(request.url.slice(8));
        if (isNaN(id) || id < 0 || id > 1) {
            ws.terminate();
            return;
        }
        players.push(new Player(id, ws));
        start();
    }
});

loadCharacters().then(() => {
    setTimeout(() => {
        if (players.length === 2) return;
        if (players.length === 0) outputApi.connectIdle(0, 1);
        outputApi.connectIdle(players[0]?.id === 0 ? 1 : 0);
    }, CONNECTION_IDLE_TIME);

    httpServer.listen(Number(process.env.PORT ?? "8888"), process.env.HOST ?? "localhost", () => {
        console.log(`Server started on ${process.env.HOST ?? "localhost"}:${Number(process.env.PORT ?? "8888")}`)
    });
});
