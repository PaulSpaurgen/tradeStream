import { ref } from 'vue'

export function useModal(initialState = false) {
  const isOpen = ref(initialState)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

// For managing multiple modals
export function useModals() {
  const modals = ref({})

  const createModal = (name, initialState = false) => {
    modals.value[name] = ref(initialState)
    return modals.value[name]
  }

  const openModal = (name) => {
    if (modals.value[name]) {
      modals.value[name].value = true
    }
  }

  const closeModal = (name) => {
    if (modals.value[name]) {
      modals.value[name].value = false
    }
  }

  const toggleModal = (name) => {
    if (modals.value[name]) {
      modals.value[name].value = !modals.value[name].value
    }
  }

  const isModalOpen = (name) => {
    return modals.value[name]?.value || false
  }

  return {
    modals,
    createModal,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen
  }
} 