<template>
  <label class="terminal-wrapper" :class="{dark: $themeName === 'dark'}">
    <span class="bracket bracket-left"></span>

    <span class="terminal-content">
      <ElTooltip content="Необязательное поле" :disabled="!optional" :popper-class="$style.popover" effect="light">
        <span :class="{prompt: true, optional: optional}">{{prompt}}</span>
      </ElTooltip>
      <ElDatePicker
          v-model="inputValue"
          class="terminal-input"
          :class="$style.date"
          :placeholder="placeholder"
          showTime showIcon iconDisplay="input"
          dateFormat="dd.mm.yy"
          :minDate="min" :maxDate="max"
          type="datetime"
      />
    </span>

    <span class="bracket bracket-right"></span>
  </label>
</template>

<script setup lang="ts">
import {onMounted, type PropType, ref} from "vue";
import {ElDatePicker, ElTooltip} from "element-plus";

const inputValue = defineModel({
  type: Object as PropType<Date | undefined>,
  required: true
});

const props = defineProps({
  label: {
    type: String,
    default: ""
  },
  mLabel: {
    type: String,
    default: ""
  },
  placeholder: String,
  password: {
    type: Boolean,
    required: false
  },
  optional: {
    type: Boolean,
    default: false
  },
  min: Date,
  max: Date
});

const prompt = ref(props.label);

function selectPrompt() {
  if (props.mLabel === "") {
    prompt.value = props.label;
    return;
  }
  if (window.matchMedia("(width >= 540px)").matches) prompt.value = props.label;
  else prompt.value = props.mLabel;
}

onMounted(() => {
  selectPrompt();
  window.addEventListener("resize", selectPrompt);
});
</script>

<style module>
.date {
  width: 100% !important;

  :global(.el-input__wrapper) {
    box-shadow: none !important;
    background: none !important;
  }
}

:global(.dark) {
  .popover {
    color: white;
  }
}
</style>

<style scoped>
.terminal-wrapper {
  display: flex;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  width: 100%;
  gap: 10px;
  position: relative;
  cursor: text;
  font-size: 16px;
}

/* Графические скобки через border */
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

.terminal-content {
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 0 10px;
  border: 1px solid gray;
  transition: all ease-in-out 0.2s;
  width: 100%;
}

.prompt {
  font-weight: bold;
  user-select: none;
  transition: text-shadow ease-in-out 0.2s;
  max-width: 60%;
  display: block;
  /*word-break: break-word;*/
  white-space: normal;
}

.optional {
  color: gray;
}

.terminal-input {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: inherit;
  outline: none;
  width: 100%;
  padding: 0;
  caret-shape: block;
  margin: 0 0 0 8px;
}

@media (hover: hover) {
  .terminal-wrapper:hover {
    .prompt {
      text-shadow: 0 0 8px #60e17b;
    }

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

    .terminal-content {
      background: #60e17b30;
      border-color: #95EAA730;
      border-radius: 5px;
    }
  }
}

.terminal-wrapper:focus-within {
  .prompt {
    text-shadow: 0 0 8px #60e17b;
  }

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

  .terminal-content {
    background: #60e17b30;
    border-color: #95EAA730;
    border-radius: 5px;
  }
}

.dark {
  .bracket {
    border: 2px solid #95EAA7FF;
  }

  .bracket-left {
    border-right: none;
  }

  .bracket-right {
    border-left: none;
  }

  .terminal-content {
    border: 1px solid #95EAA720;
  }

  .prompt {
    color: #95EAA7FF;
    text-shadow: 0 0 5px #95EAA7FF;
  }

  .optional {
    color: #b4c3b7;
  }



  @media (hover: hover) {
    .terminal-wrapper:hover {
      .prompt {
        text-shadow: 0 0 8px #95EAA7FF;
      }

      .terminal-content {
        background: #95EAA710;
        border-color: #95EAA730;
      }
    }
  }

  .terminal-wrapper:focus-within {
    .prompt {
      text-shadow: 0 0 8px #95EAA7FF;
    }

    .terminal-content {
      background: #95EAA710;
      border-color: #95EAA730;
    }
  }
}
</style>