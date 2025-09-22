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
import { computed, ref, onMounted, onUnmounted } from "vue";

// Template refs
const containerRef = ref(null);
const contentRef = ref(null);

// Reactive state for container width
const containerWidth = ref(0);

// Bio text as plain text - just provide your content, asterisks will be added automatically
const bioText = `About me

I am Abhiram Krishna M, a software engineer from Kozhikode, Kerala, India. I hold a Bachelor's degree in Computer Science from MES College of Engineering, Kuttippuram, where I discovered my passion for building user interfaces during my final year.

My professional journey began with an internship at Neolen, a startup in Ghaziabad, where I gained hands-on experience with React and React Native. This early exposure to modern JavaScript frameworks sparked my deep interest in frontend development and mobile applications.

I then joined Caprimul Technologies, a startup in my hometown, where I had the opportunity to explore Vue.js and Nuxt.js. This role expanded my technical horizons significantly, as I worked extensively with Go, Node.js, TypeScript, and various deployment technologies. It was during this time that I developed a comprehensive understanding of the JavaScript ecosystem and its vast potential.

My next career move took me to IOCOD Infotech, another local startup, where I played a pivotal role in integrating Vue.js and Nuxt.js into their existing ecosystem. I successfully integrated Node.js backends, migrated several Laravel projects to Node.js, and implemented microservice architectures that improved system scalability and maintainability.

Currently, I serve as a Software Engineer at Discern Security, where I continue to work with React.js and Nuxt.js while expanding my expertise into Django REST Framework. Throughout my career, I have been entirely self-taught in JavaScript-related technologies, driven by an unwavering passion for technology that continues to motivate me to explore new frontiers and solve complex problems in innovative ways.`;

// Function to calculate character width based on font
const getCharacterWidth = () => {
  // Create a temporary canvas to measure text width
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = "14px 'Fira Code', monospace";
  return context.measureText("M").width; // Use 'M' as it's typically the widest character
};

// Function to wrap text based on available width and add * prefix
const wrapText = (text, maxWidth, charWidth) => {
  // Account for "* " prefix (2 characters)
  const maxCharsPerLine = Math.floor(maxWidth / charWidth) - 2;
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(`* ${currentLine}`);
        currentLine = word;
      } else {
        // Handle very long words that exceed line width
        lines.push(`* ${word}`);
      }
    }
  }

  if (currentLine) {
    lines.push(`* ${currentLine}`);
  }

  return lines;
};

// Computed property to create display lines with dynamic wrapping
const displayLines = computed(() => {
  if (!containerWidth.value) {
    // Fallback: add * to each line
    const lines = bioText.split("\n");
    const result = ["/**"];
    for (const line of lines) {
      if (line.trim() === "") {
        result.push("*");
      } else {
        result.push(`* ${line}`);
      }
    }
    result.push("*/");
    return result;
  }

  const charWidth = getCharacterWidth();
  const contentWidth = containerWidth.value - 100; // Account for line numbers and padding
  const allLines = ["/**"]; // Start with comment opening

  const originalLines = bioText.split("\n");

  for (const line of originalLines) {
    if (line.trim() === "") {
      // Keep empty lines as just *
      allLines.push("*");
    } else {
      // Wrap lines that have content and add * prefix
      const wrappedLines = wrapText(line.trim(), contentWidth, charWidth);
      allLines.push(...wrappedLines);
    }
  }

  allLines.push("*/"); // End with comment closing
  return allLines;
});

// Function to update container width
const updateWidth = () => {
  if (contentRef.value) {
    containerWidth.value = contentRef.value.clientWidth;
  }
};

// Resize observer to handle window resize
let resizeObserver = null;

onMounted(() => {
  updateWidth();

  // Set up resize observer for responsive behavior
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.value) {
      resizeObserver.observe(containerRef.value);
    }
  }

  // Fallback: listen to window resize
  window.addEventListener("resize", updateWidth);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener("resize", updateWidth);
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
