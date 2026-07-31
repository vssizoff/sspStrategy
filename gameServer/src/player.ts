import { alternatives, array, int, object, oneOf, optional, string } from "parsium";
import { WebSocket, type RawData } from "ws";
import { characters, type Character } from "./characters";
import Unit from "./unit";
import State from "./state";
import {Readable} from "node:stream";

const MANA_CONTAIN_LIMIT = Number(process.env.MANA_CONTAIN_LIMIT ?? "1000");

export class ActionsError extends Error {
    override name = "ActionsError"
}

export function awaitAnswer(ws: WebSocket) {
    return new Promise<RawData>((resolve, reject) => {
        let rejected = false;
        const timeout = setTimeout(() => {
            rejected = true;
            reject(new ActionsError("WebSocket response timeout"));
        }, 1000);

        ws.once("message", data => {
            if (rejected) return;
            clearTimeout(timeout);
            resolve(data);
        });
    });
}

const actionParser = alternatives(object({
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

    constructor(public id: number, public ws: WebSocket) {
        const charactersParser = array(oneOf(characters.map(({name}) => name)), {min: 2, max: 2});
        this.initPromise = awaitAnswer(ws).then(data => {
            this.initPromise = null;
            this.units = charactersParser(data.toString("utf8")).map((character, index) => {
                return new Unit(characters.filter(({name}) => name === character)[0] as Character, this, (type) => {
                    this.state?.effectsEmit(type, this.id, index);
                });
            });
        });
        this.ws.send(JSON.stringify({emit: "init", host: "http://localhost:8888", route: `/state/${id}`}));
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

    async turn(state: State, addMana: number) {
        this.mana = Math.min(this.mana, MANA_CONTAIN_LIMIT) + addMana;
        this.usedMoves = 0;
        const promise = awaitAnswer(this.ws);
        this.ws.send(JSON.stringify({emit: "turn"}));
        try {
            await promise;
        }
        catch (e) {
            if (!(e instanceof ActionsError)) throw e;
            console.log(e);
        }
    }

    async onAction(stream: Readable, state: State) {
        try {
            const rawAction = await actionParser.stream(stream);
            if (rawAction.type === "move") {
                if (this.usedMoves > 0) {
                    throw new ActionsError(`Player ${this.id}: you cannot move more than once per turn`);
                }
                this.units[rawAction.unit]?.move();
            }
            else {
                const action = {...rawAction, template: this.units[rawAction.unit]?.character.actions[rawAction.action]};
                if (action.template === undefined) {
                    throw new ActionsError(`Player ${this.id}: unknown action: ${action.action} (unit ${action.unit} character ${this.units[action.unit]?.character.name})`);
                }
                if (action.template.mana > this.mana) {
                    throw new ActionsError(`Player ${this.id}: you do not have enought mana`);
                }
                if (action.template.type !== "noTarget"
                    && (
                        action.target === undefined
                        || (action.template.type === "enemyTarget" && !state.isEnemy(this.id, action.unit))
                        || (action.template.type === "friendTarget" && state.isEnemy(this.id, action.unit))
                    )
                ) {
                    throw new ActionsError(`Player ${this.id}: action with wrong target: ${action.action} (unit ${action.unit} character ${this.units[action.unit]?.character.name}) type ${action.template?.type}. Target: ${action.target}`);
                }
                action.template.apply(state, action.unit, action.target);
            }
        }
        catch (e) {
            if (!(e instanceof ActionsError)) throw e;
            console.log(e);
        }
    }

    toObject() {
        return {
            id: this.id,
            mana: this.mana,
            units: this.units.map(unit => unit.toObject())
        }
    }

    alive() {
        return (this.units[0]?.health ?? 0) > 0 || (this.units[1]?.health ?? 0) > 0;
    }
}
