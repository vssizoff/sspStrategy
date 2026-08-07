<script setup lang="ts">
import {onMounted, ref} from "vue";
import Visualize from "@renderer/components/Visualize.vue";

const characters = ref<[[string, string], [string, string]]>([["", ""], ["", ""]]);
const gameLog = ref<Array<any>>([]);

onMounted(() => {
  window.electron.ipcRenderer.on("game-log", (_, log) => {
    characters.value = log[0].characters;
    gameLog.value = log.slice(1);
  });
});
</script>

<template>
  <Visualize v-if="gameLog.length > 0" :characters="characters" :gameLog="gameLog"/>
</template>

<style scoped>

</style>