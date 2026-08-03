<script setup lang="ts">
import {onMounted, ref} from "vue";
import TermWindow from "@renderer/components/termui/TermWindow.vue";

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
    message.value = m;
  });
});
</script>

<template>
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

    {{message}}
  </TermWindow>
</main>
</template>

<style scoped>
* {
  color: white;
}

main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px 40px;
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
</style>