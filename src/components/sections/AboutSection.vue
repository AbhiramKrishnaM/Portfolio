<template>
  <PageSection id="about" command="cat about.txt" title="About">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] items-start">
      <article class="terminal-panel overflow-hidden">
        <div class="flex items-center gap-1.5 px-4 py-3 border-b border-border-white">
          <span class="w-3 h-3 rounded-full bg-red-500 opacity-80" />
          <span class="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
          <span class="w-3 h-3 rounded-full bg-green-500 opacity-80" />
          <span class="ml-auto text-xs text-gray-gradient-01 select-none">~/about.txt</span>
        </div>
        <div class="flex flex-col gap-4 p-5 sm:p-6 text-sm leading-relaxed text-white-gradient-01">
          <p v-for="(paragraph, i) in ABOUT_PARAGRAPHS" :key="i">{{ paragraph }}</p>
        </div>
      </article>

      <pre class="terminal-panel p-5 sm:p-6 text-sm leading-relaxed whitespace-pre-wrap"><span class="text-accent-sub">const</span> <span class="text-accent-variable">abhiram</span> <span class="text-white-gradient-01">= {</span>
<template v-for="fact in facts" :key="fact.key">  <span class="text-accent-underline">{{ fact.key }}</span><span class="text-white-gradient-01">:</span> <span class="text-accent-url">{{ fact.value }}</span><span class="text-white-gradient-01">,</span>
</template><span class="text-white-gradient-01">};</span></pre>
    </div>
    <ContributionCalendar class="mt-8" />
  </PageSection>
</template>

<script setup>
import PageSection from "@/components/sections/PageSection.vue";
import ContributionCalendar from "@/components/about/ContributionCalendar.vue";
import { ABOUT_PARAGRAPHS, OFF_SCREEN } from "@/data/about.js";
import { WHOAMI } from "@/data/profile.js";

const whoami = Object.fromEntries(WHOAMI.map(({ label, value }) => [label.trim().toLowerCase(), value]));

const STACK_ITEMS_PER_LINE = 3;

const quoted = (value) => `"${value}"`;

function formatStack(stack) {
  const items = stack.split(" · ").map(quoted);
  const rows = [];
  for (let i = 0; i < items.length; i += STACK_ITEMS_PER_LINE) {
    rows.push(`    ${items.slice(i, i + STACK_ITEMS_PER_LINE).join(", ")},`);
  }
  return `[\n${rows.join("\n")}\n  ]`;
}

const facts = [
  { key: "role", value: quoted(whoami.role) },
  { key: "location", value: quoted(whoami.loc) },
  { key: "stack", value: formatStack(whoami.stack) },
  { key: "offScreen", value: quoted(OFF_SCREEN) },
];
</script>
