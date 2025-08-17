<template>
  <button
    @click="toggle"
    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-telegram-blue focus:ring-offset-2"
    :class="modelValue ? 'bg-telegram-blue' : 'bg-gray-300 dark:bg-gray-600'"
    role="switch"
    :aria-checked="modelValue"
  >
    <span
      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
      :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
    />
  </button>
</template>

<script setup lang="ts">
import { useTelegram } from '@/composables/useTelegram'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { hapticFeedback } = useTelegram()

const toggle = () => {
  hapticFeedback('light')
  emit('update:modelValue', !props.modelValue)
}
</script>