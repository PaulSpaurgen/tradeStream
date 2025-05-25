<script setup>
import { ref, onMounted } from 'vue'

// Define props for the wrapper component
const props = defineProps({
  // Add any props you need here
  title: {
    type: String,
    default: ''
  }
})

const sliderValue = ref(100)
const sliderRef = ref(null)
const lineRef = ref(null)

const updateLinePosition = (event) => {
  const slider = sliderRef.value
  const line = lineRef.value
  if (!slider || !line) return

  // Use the value from the event if available, else from the slider
  const val = event ? Number(event.target.value) : Number(slider.value)
  const min = Number(slider.min)
  const max = Number(slider.max)
  const percent = (val - min) / (max - min)

  // Get slider width (minus thumb width for better centering)
  const thumbWidth = 24 // match your CSS
  const sliderWidth = slider.offsetWidth - thumbWidth
  const left = percent * sliderWidth + thumbWidth / 2

  line.style.left = `${left}px`
  sliderValue.value = val // keep sliderValue in sync if needed elsewhere
}

onMounted(() => {
    setTimeout(()=>{
        updateLinePosition()
    },1000)
})
</script>

<template>
  <div class="relative " >
    <input
      ref="sliderRef"
      class="overlay-slider w-full"
      type="range"
      min="0"
      max="100"
      :value="sliderValue"
      step="1"
      @input="updateLinePosition"
    />
    <!-- The vertical line -->
    <div
      ref="lineRef"
      class="absolute"
      style="width: 4px; height: 120px; background: red; top: 40px;"
    ></div>
  </div>
</template>




