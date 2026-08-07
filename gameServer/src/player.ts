import { alternatives, array, int, object, oneOf, optional, ParsingError, string } from "parsium";
import { WebSocket, type RawData } from "ws";
import { characters, type Character } from "./characters";
import Unit from "./unit";
import State from "./state";
import {Readable} from "node:stream";
import { outputApi } from "./outputApi";
import cryptoRandomString from 'crypto-random-string';

const MANA_CONTAIN_LIMIT = Number(process.env.MANA_CONTAIN_LIMIT ?? "1000");
const ACTION_IDLE_TIME = Number(process.env.ACTION_IDLE_TIME ?? "1000");

export class ActionsError extends Error {
    override name = "ActionsError"
}

export function awaitAnswer(ws: WebSocket) {
    return new Promise<RawData>((resolve, reject) => {
        let rejected = false;
        const timeout = setTimeout(() => {
            rejected = true;
            reject(new ActionsError("WebSocket response timeout"));
        }, ACTION_IDLE_TIME);

        ws.once("message", data => {
            if (rejected) return;
            clearTimeout(timeout);
            resolve(data);
        });
    });
}

export const actionParser = alternatives(object({
    type: oneOf(["move"] as const),
    unit: int()
}), object({
    type: oneOf(["action"] as const),
    unit: int(),
    action: string(),
    target: optional(int())
}));

export default class Player {
    private initPromise: Promise<void> | null;
    units: Array<Unit> = [];
    mana: number = 0;
    state: State | null = null;
    usedMoves = 0;
    token: string;

    constructor(public id: number, public ws: WebSocket) {
        this.token = cryptoRandomString({length: 32});
        const charactersParser = array(oneOf(characters.map(({name}) => name)), {min: 2, max: 2});
        this.initPromise = awaitAnswer(ws).then(data => {
            try {
                this.initPromise = null;
                this.units = charactersParser(data.toString("utf8")).map((character, index) => {
                    return new Unit(characters.filter(({name}) => name === character)[0] as Character, this, (type, ...args) => {
                      this.state?.effectsEmit(type, this.id, index, ...args);
                    });
                });
                outputApi.playerReady(id, this.units.map(u => u.character.name));
            }
            catch (e) {
                if (!(e instanceof ParsingError)) throw e;
                outputApi.initBadRequest(this.id, e.message);
            }
        }).catch(e => {
            if (!(e instanceof ActionsError)) throw e;
            outputApi.initIdle(this.id);
        });
        this.ws.send(JSON.stringify({emit: "init", host: `http://${process.env.OUTER_HOST ?? 'localhost'}:${Number(process.env.PORT ?? "8888")}`, route: `/state/${this.token}`}));
    }

    async awaitReady() {
        if (this.initPromise === null) return;
        await this.initPromise;
    }

    getStateObject(state: State) {
        return {
            emit: "turn",
            turnNumber: state.turnNumber,
            you: this.toObject(),
            enemy: state.players[(this.id + 1) % 2]?.toObject(),
            effects: state.effects.map(event => ({name: event.name, target: event.target}))
        }
    }

    addMana(x: number) {
        this.mana = Math.min(this.mana, MANA_CONTAIN_LIMIT) + x;
    }

    async turn(state: State) {
        this.usedMoves = 0;
        const promise = awaitAnswer(this.ws);
        this.ws.send(JSON.stringify({emit: "turn"}));
        try {
            await promise;
        }
        catch (e) {
            if (!(e instanceof ActionsError)) throw e;
            outputApi.actionIdle(this.id);
        }
    }

    async onAction(stream: Readable, state: State) {
        try {
            const rawAction = await actionParser.stream(stream);
            if (state.isEnemy(this.id, rawAction.unit)) {
                return outputApi.actionBadRequest(rawAction, this.id, `you cannot do action by enemy unit ${rawAction.unit}`);
            }
            if (rawAction.type === "move") {
                if (this.usedMoves > 0) {
                    return outputApi.actionBadRequest(rawAction, this.id, `you cannot move more than once per turn`);
                }
                state.units[rawAction.unit]?.move();
                outputApi.logAction(state, rawAction, this.id);
            }
            else {
                const action = {...rawAction, template: state.units[rawAction.unit]?.character.actions[rawAction.action]};
                if (action.template === undefined) {
                    return outputApi.actionBadRequest(rawAction, this.id, `unknown action: ${action.action} (unit ${action.unit} character ${state.units[action.unit]?.character.name})`);
                }
                if (action.template.mana > this.mana) {
                    return outputApi.actionBadRequest(rawAction, this.id, `you do not have enought mana`);
                }
                if (action.template.type !== "noTarget"
                    && (
                        action.target === undefined
                        || (action.template.type === "enemyTarget" && !state.isEnemy(this.id, action.unit))
                        || (action.template.type === "friendTarget" && state.isEnemy(this.id, action.unit))
                    )
                ) {
                    return outputApi.actionBadRequest(rawAction, this.id, `action with wrong target: ${action.action} (unit ${action.unit} character ${state.units[action.unit]?.character.name}) type ${action.template?.type}. Target: ${action.target}`);
                }
                this.mana -= action.template.mana;
                action.template.apply(state, action.unit, action.target);
                outputApi.logAction(state, rawAction, this.id);
            }
        }
        catch (e) {
            if (!(e instanceof ParsingError)) throw e;
            outputApi.actionBadRequest(null, this.id, e.message);
        }
    }

    toObject() {
        return {
            id: this.id,
            mana: this.mana,
            units: this.units.map((unit, i) => unit.toObject(this.id === 1 ? i + 2 : i))
        }
    }

    alive() {
        return (this.units[0]?.health ?? 0) > 0 || (this.units[1]?.health ?? 0) > 0;
    }
}
