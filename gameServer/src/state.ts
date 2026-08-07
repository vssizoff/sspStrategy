import { inspect } from "node:util";
import type { Effect } from "./characters";
import Player from "./player";
import Unit from "./unit"
import rand from "./rand";
import { outputApi } from "./outputApi";

export default class State {
    turnNumber = -1
    units: Array<Unit> = [];
    effects: Array<Effect> = [];
    currentPlayer = 0;

    constructor(public players: Array<Player>) {
        this.units = players.flatMap(player => player.units);
    }

    isEnemy(player: number, unit: number) {
        return player === 0 ? unit > 1 : unit <= 1;
    }

    effectsEmit(type: string, player: number | undefined, unit: number | undefined, ...args: Array<unknown>) {
        this.effects = this.effects.map(effect => {
            const newEffect = effect.emit(type, unit ? player === 0 ? unit : unit + 2 : undefined, ...args);
            if (newEffect) {
                if (typeof newEffect === "function") return {name: effect.name, emit: newEffect};
                return newEffect;
            }
            return effect;
        });
    }

    async turn() {
        this.turnNumber++;
        const addMana = rand.intBetween(5, 15);
        this.players.forEach(pl => pl.addMana(addMana));
        this.currentPlayer = 0;
        for (let player of this.players) {
            this.effectsEmit("turn", undefined, undefined);
            await player.turn(this);
            this.currentPlayer++;
        }
        //console.log(inspect({
        //    turnNumber: this.turnNumber,
        //    players: this.players.map(pl => pl.toObject()),
        //    effects: this.effects
        //}, true, 1000, true));
        outputApi.turnEnded(this);
    }

    checkVictory() {
        return !this.players[0]?.alive() ? 1 : !this.players[1]?.alive() ? 0 : -1;
    }

    getObject() {
        return {
            turnNumber: this.turnNumber,
            players: this.players.map(pl => pl.toObject()),
            effects: this.effects
        };
    }
}
