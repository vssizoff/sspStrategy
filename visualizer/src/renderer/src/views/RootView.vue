<script setup lang="ts">
import TermButton from "@renderer/components/termui/TermButton.vue";
import localRunIcon from "@renderer/assets/localRun.svg";
import visualizeIcon from "@renderer/assets/visualize.svg";

function localRun() {
  window.electron.ipcRenderer.invoke("localRun");
}

function visualize() {
  window.electron.ipcRenderer.invoke("visualize");
}
</script>

<template>
  <main>
    <TermButton @click="localRun">
      <div class="buttonInner">
        <img :src="localRunIcon">
        <h2>Test strategy</h2>
      </div>
    </TermButton>
    <TermButton @click="visualize">
      <div class="buttonInner">
        <img :src="visualizeIcon">
        <h2>Visualize</h2>
      </div>
    </TermButton>
  </main>
</template>

<style scoped>
main {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-evenly;
  align-items: center;
}

.buttonInner {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 300px;

  img {
    width: 240px;
  }
}
</style>