<script setup lang="ts">
import {computed, onMounted, PropType, ref, watch} from "vue";
import Card from "@renderer/components/Card.vue";

const props = defineProps({
  gameLog: {
    type: Object as PropType<Array<any>>,
    required: true
  },
  characters: {
    type: Object as PropType<[[string, string], [string, string]]>,
    required: true
  }
});

const turnNumber = ref(0);

function getUnit(player: number, unit: number) {
  const u = props.gameLog[turnNumber.value]?.state.players[player].units[unit]
  return {actingUnit: props.gameLog[turnNumber.value].unit, action: props.gameLog[turnNumber.value].action, health: u?.health as number, frontLine: u?.frontLine as boolean};
}

const state = computed(() => {
  return [
    [getUnit(0, 0), getUnit(1, 0)],
    [getUnit(0, 1), getUnit(1, 1)]
  ];
});

watch(state, () => {
  console.log(state.value);
});

onMounted(() => {
  setInterval(() => {
    turnNumber.value++;
  }, 1000);
});
</script>

<template>
  <main>
    <div v-for="(row, unitIndex) in state" class="row">
      <div v-for="(unit, index) in row" class="unit" :class="{rev: index, frontLine: unit.frontLine}">
        <Card
            :unit="unit"
            :character="characters[index][unitIndex]"
            :class="{acting: unit.actingUnit == index * 2 + unitIndex}"
            :action="unit.actingUnit == index * 2 + unitIndex ? unit.action : undefined"
            class="card"/>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  justify-content: center;
}

.row {
  display: flex;
  gap: 20px;
}

.unit {
  width: 640px;
  height: 400px;
  display: flex;
  transition: all ease-in-out 0.5s;
}

.rev {
  flex-direction: row-reverse;
}

.frontLine {
  justify-content: flex-end;
}

.card {
  transition: all ease 0.5s;
}

.acting {
  transform: scale(1.1);
}
</style>