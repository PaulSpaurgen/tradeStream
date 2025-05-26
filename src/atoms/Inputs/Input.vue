<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  inputClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const isActive = ref(false)
const isFocused = ref(false)
const isHovered = ref(false)

const labelClasses = computed(() => {
  if (isFocused.value) {
    return 'absolute left-[8px] transition-all duration-200 ease-in-out pointer-events-none text-primary-500 -top-[12px] text-[12px]'
  }
  
  if (isActive.value) {
    return 'absolute left-[8px] transition-all duration-200 ease-in-out pointer-events-none text-primary-500 -top-[12px] text-[12px]'
  }
  
  if (isHovered.value) {
    return 'absolute left-[8px] transition-all duration-200 ease-in-out pointer-events-none text-gray-200 top-1/2 -translate-y-1/2 text-[14px]'
  }
  
  return 'absolute left-[8px] transition-all duration-200 ease-in-out pointer-events-none text-gray-400 top-1/2 -translate-y-1/2 text-[14px]'
})

const inputClasses = computed(() => {
  let baseClasses = ''
  
  if (isFocused.value) {
    baseClasses = 'w-full bg-transparent border-b-2 px-[8px] py-[8px] text-white-800 outline-none transition-all duration-200 cursor-pointer border-primary-500'
  } else if (isActive.value) {
    baseClasses = 'w-full bg-transparent border-b-2 px-[8px] py-[8px] text-white-800 outline-none transition-all duration-200 cursor-pointer border-primary-500'
  } else if (isHovered.value) {
    baseClasses = 'w-full bg-transparent border-b-2 px-[8px] py-[8px] text-white-800 outline-none transition-all duration-200 cursor-pointer border-gray-300'
  } else {
    baseClasses = 'w-full bg-transparent border-b-2 px-[8px] py-[8px] text-white-800 outline-none transition-all duration-200 cursor-pointer border-gray-800'
  }
  
  // Append custom inputClass at the end
  return props.inputClass ? `${baseClasses} ${props.inputClass}` : baseClasses
})

watch(() => props.modelValue, (newValue) => { 
  if (typeof newValue === 'number') {
    isActive.value = newValue !== null && newValue !== undefined
  } else {
    isActive.value = !!newValue?.length
  }
}, { immediate: true })

const handleFocus = () => {
  isFocused.value = true
  isActive.value = true
}

const handleBlur = () => {
  isFocused.value = false
  if (typeof props.modelValue === 'number') {
    isActive.value = props.modelValue !== null && props.modelValue !== undefined
  } else {
    isActive.value = !!props.modelValue?.length
  }
}

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>

<template>
  <div 
    class="relative"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <label 
      v-if="label" 
      :class="labelClasses"
    >
      {{ label }}
    </label>
    <input
      :type="type"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :class="inputClasses"
    />
  </div>
</template>
