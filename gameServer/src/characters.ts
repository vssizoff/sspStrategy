import fs from "node:fs";
import path from "node:path";
import State from "./state"

export interface Event {
    name: string;
    target?: number;
    emit(type: string, unit?: number): void | Event["emit"] | Event;
}

export interface Action {
    type: "enemyTarget" | "friendTarget" | "noTarget";
    mana: number;
    apply(state: State, you: number, target: number | undefined): void;
}

export interface Character {
    name: string;
    health: number;
    actions: {
        [key: string]: Action;
    };
}

export let characters: Array<Character> = [];

export async function loadCharacters() {
    characters = await Promise.all((await fs.promises.readdir(path.resolve("./characters"))).map(async file => {
        return (await import(path.join(path.resolve("./characters"), file))).default as Character;
    }));
}
