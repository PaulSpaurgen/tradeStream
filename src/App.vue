<script setup>
import Chart from './components/PnlChart/Chart.vue'
import Nav from './components/Nav/Index.vue'
import OldChart from './components/PnlChart/OldChart.vue'

</script>

<template>
  <div class="font-averta  w-full flex  ">
    <Nav/>
    <div class="xl:px-[72px] px-[50px] w-full text-white-800 pt-[32px] box-border">
       <Chart/>
        <!-- <OldChart/> -->
    </div>


  </div>
</template>
