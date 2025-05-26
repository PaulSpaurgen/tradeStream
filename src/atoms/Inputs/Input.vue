<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number],
    default: ''
  },
  onChange: {
    type: Function,
    required: true
  }
})

const isActive = ref(false)
const isFocused = ref(false)
const isHovered = ref(false)

watch(() => props.value, (newValue) => {
  isActive.value = !!newValue?.length
}, { immediate: true })

const handleFocus = () => {
  isFocused.value = true
  isActive.value = true
}

const handleBlur = () => {
  isFocused.value = false
  if (!props.value?.length) {
    isActive.value = false
  }
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

const { type, label, value, onChange, ...rest } = props
</script>

<template>
  <div 
    class="relative "
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <label 
      v-if="label" 
      :class="`
        absolute left-[8px] transition-all duration-200 ease-in-out
        text-[16px] pointer-events-none
        ${isActive ? '-top-6 text-primary-500' : 'top-2'}
        ${isFocused ? 'text-primary-500' : 'text-gray-400'}
        ${isHovered && !isFocused ? 'text-gray-200' : ''}
      `"
    >
      {{ label }}
    </label>
    <input
      :type="type"
      :value="value"
      @input="(e) => onChange(e.target.value)"
      @focus="handleFocus"
      @blur="handleBlur"
      v-bind="rest"
      :class="`
        w-full bg-transparent border-b-2 px-[8px] py-[8px] 
        text-white-800 outline-none transition-all duration-200 cursor-pointer
        ${isFocused ? 'border-primary-500' : 'border-gray-800'}
        ${isHovered && !isFocused ? 'border-gray-300' : ''}
        ${isActive && !isFocused ? 'border-primary-500' : ''}
      `"
    />
  </div>
</template>
