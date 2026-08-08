import fs from "node:fs";
import path from "node:path";
import State from "./state"

export interface Effect {
    name: string;
    target?: number;
    emit(type: string, unit: number | undefined, ...args: Array<unknown>): void | Effect["emit"] | Effect;
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
    const charactersDir = process.env.CHARACTERS_DIR ?? path.resolve("./characters");
    console.log(charactersDir);
    characters = await Promise.all((await fs.promises.readdir(charactersDir)).map(async file => {
        return (await import(path.join(charactersDir, file))).default as Character;
    }));
}
