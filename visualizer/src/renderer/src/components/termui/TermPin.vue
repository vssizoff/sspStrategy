<script setup lang="ts">
import type {PropType} from "vue";
import {ElInputOtp} from "element-plus";

const model = defineModel({
  type: Object as PropType<string>
});

defineProps({
  length: {
    type: Number,
    default: 6
  },
  mask: {
    type: Boolean,
    default: false
  },
  integerOnly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="terminal-wrapper">
    <span class="bracket bracket-left"></span>
    <ElInputOtp :class="$style.input" v-model="model" :length="length" :integerOnly="integerOnly" :mask="mask" :disabled="disabled"/>
    <span class="bracket bracket-right"></span>
  </div>
</template>

<style scoped>
.terminal-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', Courier, monospace;
  gap: 10px;
  position: relative;
  cursor: text;
  font-size: 16px;
}

.bracket {
  width: 5px;
  height: calc(100% + 8px);
  border: 2px solid black;
  opacity: 0.6;
  position: absolute;
  transition: all ease-in-out 0.2s;
}

.bracket-left {
  border-right: none;
  left: 0;
}

.bracket-right {
  border-left: none;
  right: 0;
}

.terminal-wrapper:focus-within {
  .bracket {
    height: calc(100% + 12px);
  }

  .bracket-left {
    left: -8px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  .bracket-right {
    right: -8px;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
}

@media (hover: hover) {
  .terminal-wrapper:hover {
    .bracket {
      height: calc(100% + 12px);
    }

    .bracket-left {
      left: -8px;
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
    }

    .bracket-right {
      right: -8px;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
  }
}

:global(.dark) {
  .bracket {
    border: 2px solid #95EAA7FF;
  }

  .bracket-left {
    border-right: none;
  }

  .bracket-right {
    border-left: none;
  }
}
</style>

<style module>
.input {
  :global(.el-input-otp__input-field) {
    border: 1px solid gray;
    background: transparent;
    box-shadow: none !important;
    transition: background ease-in-out 0.2s;

    @media (hover: hover) {
      &:hover {
        text-shadow: 0 0 8px #60e17b;
        background: #60e17b30;
        border-color: #95EAA730 !important;
      }
    }

    &:active, &:focus {
      text-shadow: 0 0 8px #60e17b;
      background: #60e17b30;
      border-color: #95EAA730 !important;
    }
  }
}

:global(.dark) {
  .input {
    :global(.el-input-otp__input-field) {
      border: 1px solid #95EAA720;
      background: transparent;

      @media (hover: hover) {
        &:hover {
          text-shadow: 0 0 8px #95EAA7FF;
          background: #95EAA710;
          border-color: #95EAA730 !important;
        }
      }

      &:active, &:focus {
        text-shadow: 0 0 8px #95EAA7FF;
        background: #95EAA710;
        border-color: #95EAA730 !important;
      }
    }
  }
}
</style>