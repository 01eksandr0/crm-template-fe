<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue';
import AppTopbar from './components/AppTopbar.vue';
import { useSidebar } from './composables/useSidebar';

const { collapsed, toggle } = useSidebar();
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-100">
    <AppSidebar :collapsed="collapsed" />

    <div class="flex flex-1 flex-col overflow-hidden">
      <AppTopbar :collapsed="collapsed" @toggle="toggle" />
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
