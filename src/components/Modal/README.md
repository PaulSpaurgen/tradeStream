# Modal Component

A reusable modal component built with Vue 3 Composition API, featuring modern design, accessibility, and smooth transitions.

## Features

- ✅ **Vue 3 Composition API** - Modern Vue.js patterns
- ✅ **Teleport Integration** - Renders outside component hierarchy using Vue's `<Teleport>`
- ✅ **Accessibility** - ARIA attributes, keyboard navigation, focus management
- ✅ **Smooth Transitions** - CSS-based animations with scale and fade effects
- ✅ **Responsive Design** - Multiple size options and mobile-friendly
- ✅ **Dark Theme** - Matches your project's dark color scheme
- ✅ **Flexible Content** - Slots for header, body, and footer customization
- ✅ **Escape Key Support** - Close modal with ESC key
- ✅ **Overlay Click** - Close modal by clicking outside (configurable)
- ✅ **Persistent Mode** - Prevent accidental closing

## Basic Usage

```vue
<script setup>
import { ref } from 'vue'
import Modal from '@/components/Modal/Modal.vue'
import { useModal } from '@/composables/useModal'

// Using the composable (recommended)
const { isOpen, open, close } = useModal()

// Or manage state manually
const showModal = ref(false)
</script>

<template>
  <!-- Trigger button -->
  <button @click="open">Open Modal</button>

  <!-- Modal component -->
  <Modal v-model="isOpen" title="My Modal">
    <p>This is the modal content!</p>
  </Modal>
</template>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Boolean` | `false` | Controls modal visibility (v-model) |
| `title` | `String` | `''` | Modal title text |
| `size` | `String` | `'md'` | Modal size: `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `persistent` | `Boolean` | `false` | Prevent closing on ESC or overlay click |
| `showCloseButton` | `Boolean` | `true` | Show/hide the X close button |
| `maxWidth` | `String` | `''` | Custom max-width (e.g., '800px') |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Boolean` | Emitted when modal visibility changes |
| `open` | - | Emitted when modal opens |
| `close` | - | Emitted when modal closes |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Main modal content |
| `footer` | Modal footer with action buttons |

## Size Examples

```vue
<!-- Small modal -->
<Modal v-model="isOpen" size="sm" title="Small Modal">
  <p>Compact content</p>
</Modal>

<!-- Large modal -->
<Modal v-model="isOpen" size="lg" title="Large Modal">
  <div>More spacious content</div>
</Modal>

<!-- Extra large modal -->
<Modal v-model="isOpen" size="xl" title="Extra Large Modal">
  <div>Full-width charts and tables</div>
</Modal>

<!-- Custom width -->
<Modal v-model="isOpen" max-width="1200px" title="Custom Width">
  <div>Custom sized content</div>
</Modal>
```

## Advanced Usage with Footer

```vue
<Modal v-model="isOpen" title="Confirm Action">
  <p>Are you sure you want to delete this item?</p>
  
  <template #footer>
    <button 
      @click="close"
      class="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
    >
      Cancel
    </button>
    <button 
      @click="handleDelete"
      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
    >
      Delete
    </button>
  </template>
</Modal>
```

## Persistent Modal

```vue
<!-- Modal that can't be closed accidentally -->
<Modal 
  v-model="isOpen" 
  title="Important Notice"
  persistent
  :show-close-button="false"
>
  <p>This modal requires explicit action to close.</p>
  
  <template #footer>
    <button @click="handleAcknowledge">I Understand</button>
  </template>
</Modal>
```

## Using the Composable

The `useModal` composable provides convenient state management:

```vue
<script setup>
import { useModal } from '@/composables/useModal'

// Single modal
const { isOpen, open, close, toggle } = useModal()

// Multiple modals
import { useModals } from '@/composables/useModal'

const { createModal, openModal, closeModal, isModalOpen } = useModals()

// Create named modals
const confirmModal = createModal('confirm')
const settingsModal = createModal('settings')

// Control them
const showConfirm = () => openModal('confirm')
const showSettings = () => openModal('settings')
</script>
```

## Styling

The modal uses Tailwind CSS classes and matches your project's dark theme:

- Background: `bg-gray-900`
- Border: `border-gray-850`
- Text: `text-gray-100`
- Overlay: `bg-black bg-opacity-75`

## Accessibility Features

- **ARIA attributes**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **Focus management**: Automatically focuses modal when opened
- **Keyboard navigation**: ESC key to close (unless persistent)
- **Screen reader support**: Proper labeling and structure

## Browser Support

- Modern browsers with ES6+ support
- Vue 3.x required
- Teleport feature requires Vue 3.0+

## Examples in Your Project

The modal is already integrated in your `Chart.vue` component:

```vue
<!-- In Chart.vue -->
<button @click="openCumulativePnlModal">Open Cumulative PnL</button>

<Modal 
  v-model="isCumulativePnlModalOpen"
  title="Cumulative PnL Analysis"
  size="xl"
>
  <!-- Your chart content -->
</Modal>
``` 