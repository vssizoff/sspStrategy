import { inspect } from "node:util";
import State from "./state";
import type { actionParser } from "./player";

export interface OutputApi {
    connectIdle(...players: Array<number>): void;
    initIdle(player: number): void;
    initBadRequest(player: number, message: string): void;

    actionIdle(player: number): void;
    actionBadRequest(player: number, message: string): void;

    logAction(state: State, action: ReturnType<typeof actionParser>): void;

    end(winner: number | undefined): void;
}

export class CliOutputApi implements OutputApi {
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
        this.end((player + 1) % 2);
    }

    actionBadRequest(player: number, message: string): void {
        console.error(`Player ${player}: ${message}`);
        this.end((player + 1) % 2);
    }

    logAction(state: State, action: ReturnType<typeof actionParser>): void {
        console.info("Action:", inspect(action, true, 1000, true));
    }

    end(winner: number | undefined): void {
        if (winner === undefined) {
            console.log("Verdict: draft");
        }
        else {
            console.log(`Verdict: player ${winner} won`);
        }
        process.exit(0);
    }
}

export const outputApi: OutputApi = new CliOutputApi();
