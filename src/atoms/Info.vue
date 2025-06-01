<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  }
})

const isHovered = ref(false)
</script>

<template>
  <div class="relative inline-block">
    <div 
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      class="cursor-help"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        class="text-gray-400 hover:text-gray-300"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    </div>

    <div 
      v-if="isHovered"
      class="absolute z-50 w-64 p-4 mt-2 -translate-x-1/2 left-1/2 bg-gray-900 rounded-[6px] border-[1px] border-gray-850 shadow-lg !text-left"
    >
      <h3 v-if="title" class="mb-2 text-sm font-medium text-white-800">{{ title }}</h3>
      <p class="text-sm text-gray-400">{{ description }}</p>
    </div>
  </div>
</template>
