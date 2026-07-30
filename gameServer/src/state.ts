import type { Event } from "./characters";
import Player from "./player";
import Unit from "./unit"

export default class State {
    turnNumber = -1
    units: Array<Unit> = [];
    events: Array<Event> = [];

    constructor(public players: Array<Player>) {
        this.units = players.flatMap(player => player.units);
    }

    isEnemy(player: number, unit: number) {
        return player === 0 ? unit > 1 : unit <= 1;
    }

    effectsEmit(type: string, player?: number, unit?: number) {
        this.events = this.events.map(event => {
            const newEvent = event.emit(type, unit ? player === 0 ? unit : unit + 2 : undefined);
            if (newEvent) {
                if (typeof newEvent === "function") return {name: event.name, emit: newEvent};
                return newEvent;
            }
            return event;
        });
    }

    async turn() {
        this.turnNumber++;
        this.effectsEmit("turn")
        for (let player of this.players) {
            await player.turn(this, 5);
        }
    }

    checkVictory() {
        return !this.players[0]?.alive() ? 1 : !this.players[1]?.alive() ? 0 : -1;
    }
}
