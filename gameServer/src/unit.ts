import type { Character } from "./characters"
import type Player from "./player"

export default class Unit {
    health: number;
    frontLine: boolean = false;

    constructor(public character: Character, public player: Player, private emit: (type: string, ...args: Array<unknown>) => void) {
        this.health = character.health;
    }

    move(frontLine?: boolean | undefined) {
        this.emit("move");
        if (frontLine === undefined) this.frontLine = !this.frontLine;
        else this.frontLine = frontLine;
    }

    damage(x: number) {
        let change = Math.min(this.health, x);
        this.health = Math.min(0, this.health - x);
        this.emit("damage", change, x);
    }

    heal(x: number) {
        let change = Math.min(this.character.health - this.health, x);
        this.health = Math.max(this.character.health, this.health + x);
        this.emit("heal", change, x);
    }

    toObject(id: number) {
        return {
            id,
            health: this.health,
            frontLine: this.frontLine
        }
    }
}
