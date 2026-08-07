<script setup lang="ts">
import {PropType} from "vue";

const props = defineProps({
  unit: {
    type: Object as PropType<{
      health: number,
      frontLine: boolean
    }>,
    required: true
  },
  character: {
    type: String,
    required: true
  }
});
</script>

<template>
  <div class="card">
    <span class="character">{{character}}</span>
    <span class="health">{{unit.health}}</span>
  </div>
</template>

<style scoped>
.card {
  width: 300px;
  height: 400px;
  position: relative;
  border: 2px solid white;
  border-radius: 40px;

  .character {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-size: 32px;
  }

  .health {
    position: absolute;
    right: 0;
    top: 0;
    border: 2px solid white;
    border-radius: 40px;
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 60px;
  }
}
</style>