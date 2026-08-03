<script setup lang="ts">
import {onMounted, ref} from "vue";
import TermWindow from "@renderer/components/termui/TermWindow.vue";
import TermButton from "@renderer/components/termui/TermButton.vue";

const started = ref(false);
const winner = ref(-2);
const turn = ref(-1);
const players = ref([false, false]);
const message = ref("");

onMounted(() => {
  window.electron.ipcRenderer.on("game-started", () => {
    started.value = true;
  });
  window.electron.ipcRenderer.on("game-ended", (e, w: number | undefined) => {
    winner.value = w == undefined ? -1 : w;
  });
  window.electron.ipcRenderer.on("turn-ended", (e, turnNumber: number) => {
    turn.value = turnNumber;
  });
  window.electron.ipcRenderer.on("player-ready", (e, player: number) => {
    players.value[player] = true;
  });
  window.electron.ipcRenderer.on("message", (e, m: string) => {
    console.log(message.value);
    message.value = m;
  });
});

async function back() {
  await window.electron.ipcRenderer.invoke("back");
}

async function restart() {
  await window.electron.ipcRenderer.invoke("restart");
  started.value = false;
  winner.value = -2;
  turn.value = -1;
  players.value = [false, false];
  message.value = "";
}

async function save() {
  await window.electron.ipcRenderer.invoke("save");
}

async function visualize() {
  await window.electron.ipcRenderer.invoke("visualize");
}
</script>

<template>
<div class="main-container">
  <main>
    <h2 v-if="winner != -2">Game ended: {{winner == -1 ? "Draft" : `Player ${winner} won`}}</h2>
    <h2 v-else-if="turn >= 0">Done turns: {{turn}}</h2>
    <h2 v-else-if="started">Game started</h2>
    <h2 v-else>Waiting for players</h2>

    <div class="players">
      <TermWindow v-for="(ready, index) in players" class="player">
        <template #header>
          Player {{index}}
        </template>
        <span v-if="!ready">
          Url to connect: ws://localhost:8888/player/{{index}}
        </span>
        <span v-else class="ready">
          {{winner == -2 ? started ? "Playing" : "Ready" : winner == index ? "Won" : winner == (index + 1) % 2 ? "Lost" : "Draft"}}
        </span>
      </TermWindow>
    </div>

    <TermWindow v-if="message" class="message">
      <template #header>
        Message
      </template>

      <span v-for="mess in message.split('\n')">{{mess}}</span>
    </TermWindow>
  </main>

  <div class="buttons">
    <TermButton @click="back">Back to home screen</TermButton>
    <TermButton @click="restart">Restart server</TermButton>
    <TermButton @click="save">Save game log</TermButton>
    <TermButton @click="visualize">View visualization</TermButton>
  </div>
</div>
</template>

<style scoped>
* {
  color: white;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.players {
  display: flex;
  gap: 20px;
  width: 100%;
}

.player {
  width: 100%;
}

h2 {
  color: #95EAA7FF;
  text-shadow: 0 0 5px #95EAA7FF;
  padding: 10px;
  font-size: 64px;
  font-weight: bold;
  margin: 0;
}

.message {
  width: 100%;
}

.main-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 0 40px;
  margin: 0;
}

.buttons {
  display: flex;
  margin-bottom: 20px;
  justify-content: center;
  gap: 20px;
}
</style>