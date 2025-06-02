<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import HomeIcon from '../../assets/Home.svg'
import Logo from '../../assets/Logomark.svg'
import graphIcon from '../../assets/graph.svg'
import DashboardIcon from '../../assets/dashboard.svg'
import ReportIcon from '../../assets/report.svg'
import { RouterLink  } from 'vue-router'

const route = useRoute()

const navLinks = ref([
    {
        name: 'Home',
        path: '/',
        icon: HomeIcon,
        isActive: route.path === '/'
    },
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: DashboardIcon,
        isActive: route.path === '/dashboard'
    },
    {
        name: 'Report',
        path: '/report',
        icon: ReportIcon,
        isActive: route.path === '/report'
    },
    {
        name: 'Analytics',
        path: '/analytics',
        icon: graphIcon,
        isActive: route.path === '/analytics'
    },
])

// Watch for route changes and update active states
watch(
    () => route.path,
    (newPath) => {
        navLinks.value = navLinks.value.map(link => ({
            ...link,
            isActive: link.path === newPath
        }))
    }
)
</script>

<style scoped>
.router-link-active::before,
.router-link-exact-active::before {
    opacity: 1 !important;
}

.menu-item.active::before {
    opacity: 1 !important;
}

.menu-item {
    position: relative;
}

.menu-item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    transition: 0.2s;
    border-radius: 0 4px 4px 0;
    background: theme('colors.primary.500');
    width: 4px;
    opacity: 0;
}

</style>

<template>
    <nav class=" h-screen w-[70px] bg-og-gray pt-[24px] pb-[32px] fixed top-0 left-0">
        <div class="flex items-center justify-center mb-[48px]">
            <Logo />
        </div>

        <RouterLink v-for="link in navLinks" :key="link.path" :to="link.path" :class="['cursor-pointer group relative menu-item block', { active: link.isActive }]"
        >
            <div :class="['p-[10px] flex items-center justify-center h-[56px] w-full group-hover:bg-gray-900 transition-colors duration-200', { 'bg-gray-900': link.isActive }]">
                <component :is="link.icon" :class="['w-[24px] h-[24px] xl:w-auto xl:h-auto text-gray-700 group-hover:text-primary-500 transition-colors duration-200', { '!text-primary-500': link.isActive }]" />
            </div>
            <div
                class="text-gray-700 z-10 absolute bg-gray-900 top-0 left-[100%] w-max !text-white-800 font-semibold h-full px-[16px] flex items-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                {{ link.name }}
            </div>

        </RouterLink>
    </nav>
</template>
