<template>
  <footer class="relative z-10 border-t border-border-white px-5 sm:pl-28 sm:pr-10 lg:pl-32 lg:pr-20 xl:pl-36 pt-10 pb-28 sm:pb-10">
    <div class="mx-auto max-w-5xl flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div class="flex flex-col gap-1">
        <p class="text-accent-variable text-sm">// let's build something together</p>
        <a :href="social('email').url" class="text-white-gradient-01 hover:text-accent-url text-sm" data-cursor="send email">{{ EMAIL }}</a>
      </div>

      <ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Social links">
        <li v-for="link in otherLinks" :key="link.id">
          <a :href="link.url" target="_blank" rel="noopener noreferrer" class="text-gray-gradient-01 hover:text-accent-url"
            :data-cursor="link.label">{{ link.text }}</a>
        </li>
      </ul>

      <div class="flex flex-col gap-1 text-xs text-gray-gradient-01">
        <p>© {{ year }} Abhiram Krishna M · <span class="text-accent-variable">$</span> exit 0</p>
        <p>
          keyboard model by
          <a href="https://blendswap.com/blend/28909" target="_blank" rel="noopener noreferrer" class="hover:text-accent-url"
            data-cursor="model credit">Benbop</a>
          (CC-BY)
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { EMAIL, SOCIALS, social } from "@/data/socials.js";

const year = new Date().getFullYear();
const otherLinks = SOCIALS.filter((s) => s.id !== "email");
</script>
