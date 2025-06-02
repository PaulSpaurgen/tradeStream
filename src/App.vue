<script setup>
import Chart from './components/PnlChart/Chart.vue'
import Nav from './components/Nav/Index.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="font-averta  w-full flex  ">
    <Nav/>
    <div class="xl:px-[72px] px-[50px] w-full text-white-800 pt-[32px] ml-[70px] box-border">
       <RouterView/>
    </div>


  </div>
</template>
