<script setup lang="ts">
import {onMounted, ref} from "vue";

defineProps({
  noHeader: {
    type: Boolean,
    default: false
  },
  prompt: String
});

const h = ref("");
const v = ref("");

onMounted(() => {
  for (let i = 0; i < 1000; i++) {
    h.value += '—';
    v.value += "|";
  }
});
</script>

<template>
<section :class="{dark: $themeName === 'dark'}">
  <div class="prompt" v-if="prompt">{{prompt}}</div>
  <div class="header" v-if="!noHeader">
    <slot name="header"/>
  </div>
  <div class="content">
    <slot/>
  </div>
</section>
</template>

<style scoped>
section {
  display: inline-flex;
  flex-direction: column;
  border-radius: 5px;
  outline-offset: -5px;
  position: relative;
  overflow: hidden;
  padding: 10px;
  font-family: 'Courier New', Courier, monospace;
  border: 1px solid rgba(149, 234, 167, 0.8);

  .header {
    padding: 10px;
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
  }

  .content {
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .prompt {
    @media (width < 480px) {
      font-size: 12px;
    }
  }
}

.dark {
  background: rgba(96, 151, 109, 0.04);

  .header, .header * {
    color: #95EAA7FF;
    text-shadow: 0 0 5px #95EAA7FF;
  }

  .prompt {
    color: #95EAA7FF;
    text-shadow: 0 0 5px #95EAA7FF;
  }
}
</style>