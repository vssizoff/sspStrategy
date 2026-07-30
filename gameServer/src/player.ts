import { alternatives, array, int, object, oneOf, optional, string } from "parsium";
import { WebSocket, type RawData } from "ws";
import { characters, type Character } from "./characters";
import Unit from "./unit";
import State from "./state"

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

const actionsParser = array(alternatives(object({
    type: oneOf(["move"] as const),
    unit: int()
}), object({
    type: oneOf(["action"] as const),
    unit: int(),
    action: string(),
    target: optional(int())
})));

export default class Player {
    private initPromise: Promise<void> | null;
    units: Array<Unit> = [];
    mana: number = 0;
    state: State | null = null;

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
        this.ws.send('{"emit": "init"}');
    }

    async awaitReady() {
        if (this.initPromise === null) return;
        await this.initPromise;
    }

    async turn(state: State, addMana: number) {
        this.mana = Math.min(this.mana, MANA_CONTAIN_LIMIT) + addMana;
        const promise = awaitAnswer(this.ws);
        this.ws.send(JSON.stringify({
            emit: "turn",
            turnNumber: state.turnNumber,
            you: this.toObject(),
            enemy: state.players[(this.id + 1) % 2]?.toObject(),
            events: state.events.map(event => ({name: event.name, target: event.target}))
        }));
        try {
            const rawActions = actionsParser(await promise);
            const moves = rawActions.filter(({type}) => type === "move");
            if (moves.length > 1) {
                throw new ActionsError(`Player ${this.id}: you cannot move more than once per turn`);
            }
            const actions = rawActions.map(action => ({
                ...action,
                template: action.type === "action" ? this.units[action.unit]?.character.actions[action.action] : undefined
            }));
            const unknownActions = actions.filter((action) => action.type === "action" && action.template === undefined);
            if (unknownActions.length > 0) {
                throw new ActionsError(`Player ${this.id}: unknown actions:\n` + unknownActions
                    .map((action) => action.type === "action" ? `${action.action} (unit ${action.unit} character ${this.units[action.unit]?.character.name})` : "")
                    .join('\n'));
            }
            let requiredMana = 0;
            actions.forEach(action => {requiredMana += action.template?.mana ?? 0});
            if (requiredMana > this.mana) {
                throw new ActionsError(`Player ${this.id}: you do not have enought mana`);
            }
            const wrongTypeActions = actions.filter(action => action.type === "action" && action.template?.type !== "noTarget"
                && (
                    action.target === undefined
                    || (action.template?.type === "enemyTarget" && !state.isEnemy(this.id, action.unit))
                    || (action.template?.type === "friendTarget" && state.isEnemy(this.id, action.unit))
                )
            );
            if (wrongTypeActions.length > 0) {
                throw new ActionsError(`Player ${this.id}: actions with wrong target:\n` + wrongTypeActions
                    .map((action) => action.type === "action" ? `${action.action} (unit ${action.unit} character ${this.units[action.unit]?.character.name}) type ${action.template?.type}. Target: ${action.target}` : "")
                    .join('\n'));
            }
            actions.forEach(action => {
                if (this.units[action.unit]?.health === 0) return;
                if (action.type === "move") {
                    this.units[action.unit]?.move();
                    return;
                }
                action.template?.apply(state, action.unit, action.target);
            });
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
