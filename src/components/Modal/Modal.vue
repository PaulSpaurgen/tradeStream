<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  persistent: {
    type: Boolean,
    default: false
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  maxWidth: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'open'])

const modalRef = ref(null)
const isVisible = ref(false)

// Size classes mapping
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full'
}

// Define functions before using them in watchers
const openModal = () => {
  isVisible.value = true
  emit('open')
  nextTick(() => {
    // Focus the modal for accessibility
    if (modalRef.value) {
      modalRef.value.focus()
    }
    // Prevent body scroll while preserving scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
  })
}

const closeModal = () => {
  if (!props.persistent) {
    isVisible.value = false
    emit('update:modelValue', false)
    emit('close')
    // Restore body scroll and remove padding
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    openModal()
  } else {
    closeModal()
  }
}, { immediate: true })

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget && !props.persistent) {
    closeModal()
  }
}

const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && !props.persistent) {
    closeModal()
  }
}

// Add/remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  // Restore body scroll and remove padding on unmount
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
        @click="handleOverlayClick"
      >
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>
        
        <!-- Modal Content -->
        <div
          ref="modalRef"
          :class="[
            'relative bg-gray-800 rounded-[6px] shadow-xl border border-gray-850 w-full z-10 my-8',
            sizeClasses[size],
            maxWidth ? `max-w-[${maxWidth}]` : ''
          ]"
          tabindex="-1"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? 'modal-title' : undefined"
        >
          <!-- Header -->
          <div v-if="title || showCloseButton" class="flex items-center justify-between p-6 border-b border-gray-850 bg-gray-950 ">
            <h3 v-if="title" id="modal-title" class="text-xl font-semibold text-gray-100">
              {{ title }}
            </h3>
            <div v-else></div>
            
            <button
              v-if="showCloseButton"
              @click="closeModal"
              class="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-gray-800"
              aria-label="Close modal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Body -->
          <div class="p-6">
            <slot></slot>
          </div>
          
          <!-- Footer -->
          <div v-if="$slots.footer" class="flex items-center justify-end gap-3 p-6 border-t border-gray-850">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal transition animations */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.3s ease-in;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style> 