<template>
  <label class="terminal-wrapper dark">
    <span class="bracket bracket-left"></span>

    <span class="terminal-content">
      <input
          v-if="!int && !float"
          :type="password ? 'password' : 'text'"
          v-model="inputValue"
          class="terminal-input"
          :placeholder="placeholder"
          @input="onInput"
          :disabled="disabled"
      />
      <input
          v-else
          type="text"
          v-model="inputValue"
          class="terminal-input"
          :placeholder="placeholder"
          @keydown="inputHandler"
          inputmode="numeric"
          @input="onInput"
          :disabled="disabled"
      />
    </span>

    <span class="bracket bracket-right"></span>
  </label>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";

const op = ref();
const focus = ref(false);
const inputValue = defineModel({ type: String });

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
  int: {
    type: Boolean,
    required: false
  },
  float: {
    type: Boolean,
    required: false
  },
  optional: {
    type: Boolean,
    default: false
  },
  min: Number,
  max: Number,
  pattern: RegExp,
  noBreak: Boolean,
  disabled: {
    type: Boolean,
    default: false
  }
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

function inputHandler(event: KeyboardEvent) {
  if (event.key.length != 1 || event.ctrlKey || event.altKey || event.metaKey) return;
  let value = ((event.target as HTMLInputElement)?.value + event.key).replaceAll(',', '.');
  if (props.float && !Number.isFinite(Number(value))) return event.preventDefault();
  let match = value.match(/[0-9]*/);
  if (props.int && (!match || !match[0] || match[0].length != value.length)) return event.preventDefault();
}

function onInput(event: InputEvent) {
  // console.log(op.value);
  // const value = (event.target as HTMLInputElement).value;
  // if (value === "") {
  //   op.value.hide();
  //   return;
  // }
  // if (!props.int && !props.float) {
  //   if (props.min != undefined && value.length < props.min) op.value.show(event);
  //   else if (props.max != undefined && value.length > props.max) op.value.show(event);
  //   else if (props.pattern != undefined && !props.pattern.test(value)) op.value.show(event);
  //   else op.value.hide();
  // }
  // else {
  //   if (props.min != undefined && Number(value) < props.min) op.value.show(event);
  //   else if (props.max != undefined && Number(value) > props.max) op.value.show(event);
  //   else op.value.hide();
  // }
  focus.value = true;
}
</script>

<style module>
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
  padding: 5px 10px;
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
}

.lineBreak {
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