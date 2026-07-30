import * as ws from "ws";
import {createServer} from "node:http";
import Player from "./player.js";
import State from "./state.js";
import { loadCharacters } from "./characters.js";

const PLAYERS_COUNT = 2;
let players: Array<Player> = [];
let gameStarted = false;

async function start() {
    if (players.length < PLAYERS_COUNT || gameStarted) return;
    gameStarted = true;
    await Promise.all(players.map(player => player.awaitReady()));
    const state = new State(players.toSorted((a, b) => a.id - b.id));

}

const httpServer = createServer();
const wss = new ws.WebSocketServer({
    server: httpServer
});

wss.on("connection", (ws, request) => {
    if (request.url?.startsWith("/player/")) {
        players.push(new Player(Number(request.url.slice(8)), ws));
        start();
    }
});

loadCharacters().then(() => {
    httpServer.listen(Number(process.env.PORT ?? "8888"), process.env.HOST ?? "localhost", () => {
        console.log(`Server started on ${process.env.HOST ?? "localhost"}:${Number(process.env.PORT ?? "8888")}`)
    });
});
