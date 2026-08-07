import { inspect } from "node:util";
import State from "./state";
import type { actionParser } from "./player";
import fs from "node:fs";
import path from "node:path";
import cryptoRandomString from 'crypto-random-string';
import {post} from "superagent";

export interface OutputApi {
    connectIdle(...players: Array<number>): void;
    initIdle(player: number): void;
    initBadRequest(player: number, message: string): void;

    actionIdle(player: number): void;
    actionBadRequest(action: unknown, player: number, message: string): void;

    playerReady(player: number, characters: Array<string>): void;
    gameStarted(): void;

    logAction(state: State, action: ReturnType<typeof actionParser>, player: number): void;
    turnEnded(state: State): void;

    end(winner: number | undefined): void;
}

export class CliOutputApi implements OutputApi {
    gameLog: Array<unknown> = [];

    connectIdle(...players: Array<number>): void {
        players.forEach(player => console.error(`Player ${player}: connection timed out`));
        this.end(undefined);
    }

    initIdle(player: number): void {
        console.error(`Player ${player}: init WebSocket response timed out`);
        this.end(undefined);
    }

    initBadRequest(player: number, message: string): void {
        console.error(`Player ${player}: ${message}`);
        this.end(undefined);
    }

    actionIdle(player: number): void {
        console.error(`Player ${player}: WebSocket response timed out`);
        this.gameLog.push({idle: true, correct: false, player});
        this.end((player + 1) % 2);
    }

    actionBadRequest(action: unknown, player: number, message: string): void {
        console.error(`Player ${player}: ${message}`);
        this.gameLog.push({action, correct: false, player, message});
        this.end((player + 1) % 2);
    }

    playerReady(player: number, characters: Array<string>): void {
        console.log(`Player ${player} ready`);
    }

    gameStarted(): void {
        console.log("Game started");
    }

    logAction(state: State, action: ReturnType<typeof actionParser>, player: number): void {
        //console.info("Action:", inspect(action, true, 1000, true));
        this.gameLog.push({...action, correct: true, state: state.getObject(), player});
    }

    turnEnded(state: State): void {
        console.log(`Turn ${state.turnNumber} ended`);
    }

    end(winner: number | undefined): void {
        const file = path.resolve(`game-${cryptoRandomString({length: 10})}.log`);
        fs.writeFileSync(file, JSON.stringify(this.gameLog, undefined, 4), {encoding: "utf8"});
        if (winner === undefined) {
            console.log("Verdict: draft");
        }
        else {
            console.log(`Verdict: player ${winner} won`);
        }
        console.log(`Game log written to ${file}`)
        process.exit(0);
    }
}

const OUTPUT = process.env.OUTPUT;

export class HttpOutputApi implements OutputApi {
    constructor(private host: string) {}

    connectIdle(...players: Array<number>): void {
        post(this.host + "/connection-idle").send(players).ok(() => true).end();
    }

    initIdle(player: number): void {
        post(this.host + `/init-idle/${player}`).ok(() => true).end();
    }

    initBadRequest(player: number, message: string): void {
        post(this.host + `/init-bad-request/${player}`).send({message}).ok(() => true).end();
    }

    actionIdle(player: number): void {
        post(this.host + `/action-idle/${player}`).ok(() => true).end();
    }

    actionBadRequest(action: unknown, player: number, message: string): void {
        post(this.host + `/action-bad-request/${player}`).send({action, player, message}).ok(() => true).end();
    }

    playerReady(player: number, characters: Array<string>): void {
        post(this.host + `/player-ready/${player}`).send(characters).ok(() => true).end();
    }

    gameStarted(): void {
        post(this.host + `/game-started`).ok(() => true).end();
    }

    logAction(state: State, action: ReturnType<typeof actionParser>, player: number): void {
        post(this.host + "/action").send({...action, state: state.getObject(), player}).ok(() => true).end();
    }

    turnEnded(state: State): void {
        post(this.host + `/turn-ended/${state.turnNumber}`).ok(() => true).end();
    }

    end(winner: number | undefined): void {
        post(this.host + `/game-ended`).send({winner}).ok(() => true).end();
    }
}

export const outputApi: OutputApi = OUTPUT ? new HttpOutputApi(OUTPUT) : new CliOutputApi();
