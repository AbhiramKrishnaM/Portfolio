<template>
  <PageSection id="contact" command="contact" title="Let's talk">
    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] items-center">
      <div class="contact-cta terminal-panel p-6 sm:p-10 flex flex-col gap-6" :class="{ 'contact-cta--hidden': !contactRevealed }">
        <p class="text-white-gradient-01 max-w-2xl leading-relaxed">
          Have a role, a project, or an idea you want to build? My inbox is open.
        </p>

        <div class="flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-start gap-3">
          <span class="email text-base sm:text-xl text-accent-url break-words">{{ EMAIL }}</span>
          <div class="flex gap-3">
            <button type="button" class="action-btn" data-cursor="copy email" @click="copyEmail">copy-email</button>
            <a :href="social('email').url" class="action-btn action-btn--primary" data-cursor="send email">say-hello</a>
          </div>
        </div>

        <ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Elsewhere">
          <li v-for="link in otherLinks" :key="link.id">
            <a :href="link.url" target="_blank" rel="noopener noreferrer" class="text-gray-gradient-01 hover:text-accent-url"
              :data-cursor="link.label">{{ link.text }} ↗</a>
          </li>
        </ul>
      </div>
      <div class="contact-box-slot hidden lg:block" data-story-anchor="contact" aria-hidden="true" />
    </div>
  </PageSection>
</template>

<script setup>
import PageSection from "@/components/sections/PageSection.vue";
import { EMAIL, SOCIALS, social } from "@/data/socials.js";
import { copyEmail } from "@/composables/contactActions.js";
import { contactRevealed } from "@/composables/storyline.js";

const otherLinks = SOCIALS.filter((s) => s.id !== "email");
</script>

<style scoped>
.contact-cta {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.contact-cta--hidden {
  opacity: 0;
  transform: translateY(16px);
}

.contact-box-slot {
  min-height: 380px;
}

.action-btn {
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--color-accent-variable);
  border-radius: 8px;
  color: var(--color-accent-variable);
  font-size: 0.875rem;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.action-btn:hover,
.action-btn--primary {
  background-color: var(--color-accent-variable);
  color: var(--color-theme-main);
}

.action-btn--primary:hover {
  background-color: transparent;
  color: var(--color-accent-variable);
}
</style>
