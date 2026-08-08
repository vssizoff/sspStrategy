import {homedir} from "node:os";
import {join, resolve} from "path";
import * as fs from "node:fs";
import superagent from "superagent";
import {dialog} from "electron";
import * as tar from "tar-stream";
import {PassThrough, Readable, Writable} from "node:stream";
import path from "node:path";
import {pipeline, finished} from "node:stream/promises";
import {fetch} from "undici";

const releaseUrl = `https://api.github.com/repos/vssizoff/sspStrategy/releases/latest`;
export const gameServerDir = join(process.platform === "win32" ? (process.env.APPDATA ?? homedir()) : join(homedir(), ".local", "share"), 'ssp2026-strategy');
export const executablePath = join(gameServerDir, process.platform === "win32" ? `gameServer-${process.platform}.exe` : `gameServer-${process.platform}`);
export const charactersPath = join(gameServerDir, "characters");

async function getFile(file: string, stream: Writable): Promise<void> {
    const response = await fetch(file);
    if (response.status !== 200 || !response.body) {
        dialog.showErrorBox("Failed to download release", `Github returned http code: ${response.status}\nFile: ${file}`);
        process.exit(1);
    }
    Readable.fromWeb(response.body).pipe(stream);
}

async function extractTar(
    input: Readable,
    destination: string
) {
    await fs.promises.mkdir(destination, { recursive: true });

    const extract = tar.extract();

    extract.on("entry", async (header, entry, next) => {
        try {
            // Prevent tar-slip / path-traversal writes.
            const filename = resolve(destination, header.name);
            if (!filename.startsWith(resolve(destination) + path.sep)) {
                entry.resume();
                return next(new Error(`Unsafe archive path: ${header.name}`));
            }

            if (header.type === "directory") {
                await fs.promises.mkdir(filename, { recursive: true });
                entry.resume();
                entry.once("end", next);
                return;
            }

            // Do not extract symlinks/devices from untrusted archives.
            if (header.type !== "file") {
                entry.resume();
                entry.once("end", next);
                return;
            }

            await fs.promises.mkdir(path.dirname(filename), { recursive: true });
            await pipeline(entry, fs.createWriteStream(filename, { mode: header.mode }));
            next();
        } catch (err) {
            // next(err as Error);
            console.error(err);
        }
    });

    await pipeline(input, extract);
}

async function getRelease() {
    const releaseResponse = await superagent.get(releaseUrl).ok(() => true).set("User-Agent", "sspStrategy");
    if (releaseResponse.status !== 200) {
        return null;
    }
    return JSON.parse(releaseResponse.text);
}

export function getAssets(release: any) {
    const gameServer = release.assets.filter(asset => asset.name.startsWith(`gameServer-${process.platform}`))[0];
    if (!gameServer) {
        dialog.showErrorBox("Game server not found", `gameServer-${process.platform} not found`);
        process.exit(1);
    }
    const characters = release.assets.filter(asset => asset.name === "characters.tar")[0];
    if (!characters) {
        dialog.showErrorBox("Characters not found", "characters.tar not found");
        process.exit(1);
    }
    return {gameServer, characters};
}

export async function downloadCore() {
    dialog.showMessageBox({message: "Downloading core"});
    const release = await getRelease();
    if (!release) {
        dialog.showErrorBox("Failed to download release", `Github returned wrong http code`);
        process.exit(1);
    }
    const {gameServer, characters} = getAssets(release);
    if (!fs.existsSync(gameServerDir)) {
        await fs.promises.mkdir(gameServerDir, {recursive: true});
    }
    const stream = fs.createWriteStream(executablePath);
    await getFile(gameServer.browser_download_url, stream);
    await finished(stream);
    await fs.promises.chmod(executablePath, 755);
    const charactersStream = new PassThrough();
    await getFile(characters.browser_download_url, charactersStream);
    await extractTar(charactersStream, charactersPath);
    await fs.promises.writeFile(join(gameServerDir, "digest.json"), JSON.stringify({
        gameServer: gameServer.digest,
        characters: characters.digest
    }), {encoding: "utf8"});
    dialog.showMessageBox({message: "Core downloaded"});
}

export async function checkCoreUpdates() {
    if (!fs.existsSync(join(gameServerDir, "digest.json"))) {
        await downloadCore();
        return;
    }
    const release = await getRelease();
    if (!release) {
        if (!fs.existsSync(join(gameServerDir, "digest.json"))) {
            dialog.showErrorBox("Failed to download release", `Github returned wrong http code`);
            process.exit(1);
        }
        return;
    }
    const {gameServer, characters} = getAssets(release);
    const digests = JSON.parse(await fs.promises.readFile(join(gameServerDir, "digest.json"), { encoding: "utf8"}));
    if (gameServer.digest !== digests.gameServer || characters.digest !== digests.characters) await downloadCore();
}