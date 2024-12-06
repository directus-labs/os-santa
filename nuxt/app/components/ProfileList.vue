<script setup lang="ts">
import type { ProfileWithLikes } from '#shared/types/endpoints';

interface Props {
  title: string
  profiles: Array<ProfileWithLikes>
  type: 'naughty' | 'nice'
}

defineProps<Props>()
</script>

<template>
  <div>
    <h3 class="text-center font-serif font-bold items-center flex gap-2 justify-center text-xl sm:text-2xl mb-4"
      :class="type === 'naughty' ? 'text-red-700' : 'text-green-700'">
      <UIcon v-if="type === 'naughty'" name="mdi:emoticon-devil-outline" class="h-4 w-4 sm:h-5 sm:w-5 text-red-700" />
      {{ title }}
      <span class="text-sm">({{ profiles.length }})</span>
    </h3>
    <div v-auto-animate class="relative max-h-[500px] overflow-y-auto list-container">
      <NuxtLink v-for="profile in profiles" :key="profile.username" :to="`/${profile.username}`"
        class="flex items-center justify-between p-3 border-b border-[#d4b995] hover:bg-[#f0e0c6] transition-colors duration-200">
        <User :username="profile.username" :avatar="`https://github.com/${profile.username}.png`" />
        <div class="flex items-center gap-1">
          <Icon name="icon-park-outline:chili" class="h-4 w-4 sm:h-5 sm:w-5 text-red-700" />
          <span class="font-mono font-bold text-lg sm:text-2xl">{{ profile.meta?.totalLikes || 0 }}</span>
        </div>
      </NuxtLink>
      <div v-if="profiles.length === 0" class="text-center py-4 text-gray-500">No matches found</div>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #d4b995 #f8f1e6;
}

/* Chrome, Edge, Safari */
.list-container::-webkit-scrollbar {
  width: 8px;
}

.list-container::-webkit-scrollbar-track {
  background: #f8f1e6;
  border-radius: 4px;
}

.list-container::-webkit-scrollbar-thumb {
  background-color: #d4b995;
  border-radius: 4px;
  border: 2px solid #f8f1e6;
}

.list-container::-webkit-scrollbar-thumb:hover {
  background-color: #c4a785;
}
</style>
