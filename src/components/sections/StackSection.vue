<template>
  <PageSection id="stack-list" command="ls stack" title="Stack" data-section-fallback="stack">
    <StackGrid />
  </PageSection>
</template>

<script setup>
import PageSection from "@/components/sections/PageSection.vue";
import StackGrid from "@/components/stack/StackGrid.vue";
</script>
