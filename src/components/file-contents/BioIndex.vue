<template>
  <div class="file-content flex" ref="containerRef">
    <!-- Line numbers column styled like VS Code (with border removed) -->
    <div
      class="line-numbers py-3 text-right text-[#607B96] select-none flex-shrink-0"
      style="min-width: 50px"
    >
      <div
        v-for="(line, index) in displayLines"
        :key="index"
        class="line-number px-2 h-[24px] flex items-center justify-end"
      >
        {{ index + 1 }}
      </div>
    </div>

    <!-- File content with proper VS Code-like spacing -->
    <div class="code-content py-3 pl-4 text-blue-300 flex-1" ref="contentRef">
      <div
        v-for="(line, index) in displayLines"
        :key="index"
        class="code-line h-[24px] flex items-center"
      >
        {{ line }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTextWrapper } from "@/composables/useTextWrapper";

// Bio text as plain text - just provide your content, asterisks will be added automatically
const bioText = `About me

I am Abhiram Krishna M, a software engineer from Kozhikode, Kerala, India. I hold a Bachelor's degree in Computer Science from MES College of Engineering, Kuttippuram, where I discovered my passion for building user interfaces during my final year.

My professional journey began with an internship at Neolen, a startup in Ghaziabad, where I gained hands-on experience with React and React Native. This early exposure to modern JavaScript frameworks sparked my deep interest in frontend development and mobile applications.

I then joined Caprimul Technologies, a startup in my hometown, where I had the opportunity to explore Vue.js and Nuxt.js. This role expanded my technical horizons significantly, as I worked extensively with Go, Node.js, TypeScript, and various deployment technologies. It was during this time that I developed a comprehensive understanding of the JavaScript ecosystem and its vast potential.

My next career move took me to IOCOD Infotech, another local startup, where I played a pivotal role in integrating Vue.js and Nuxt.js into their existing ecosystem. I successfully integrated Node.js backends, migrated several Laravel projects to Node.js, and implemented microservice architectures that improved system scalability and maintainability.

Currently, I serve as a Software Engineer at Discern Security, where I continue to work with React.js and Nuxt.js while expanding my expertise into Django REST Framework. Throughout my career, I have been entirely self-taught in JavaScript-related technologies, driven by an unwavering passion for technology that continues to motivate me to explore new frontiers and solve complex problems in innovative ways.`;

// Use the text wrapper composable
const { containerRef, contentRef, displayLines } = useTextWrapper({
  text: bioText,
  fontFamily: "Fira Code",
  fontSize: 14,
  commentStyle: "js",
  lineNumberWidth: 50,
  padding: 50,
});
</script>

<style scoped>
.file-content {
  font-family: "Fira Code", monospace;
  font-size: 14px;
  min-height: 100%;
}

.line-number {
  font-size: 12px;
  color: #607b96;
}

.code-content {
  min-width: 0; /* Allow flex item to shrink below content size */
  overflow: hidden; /* Prevent horizontal scrolling */
}

.code-line {
  white-space: nowrap; /* Keep individual lines from wrapping in CSS */
  overflow: hidden; /* Hide any overflow */
  text-overflow: ellipsis; /* Add ellipsis for very long lines */
}

/* Optional: add a subtle highlight on hover like VS Code does */
.code-line:hover {
  background-color: rgba(30, 45, 61, 0.4);
}

/* Custom scrollbar styling */
.code-content::-webkit-scrollbar {
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: #1e2d3d;
}

.code-content::-webkit-scrollbar-thumb {
  background: #607b96;
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: #7c8a9a;
}
</style>
