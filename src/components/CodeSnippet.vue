<template>
  <div class="code-snippet bg-[#011627] rounded-md overflow-hidden">
    <div
      class="snippet-header bg-[#1E2D3D] p-2 flex items-center justify-between text-xs"
    >
      <div class="flex items-center">
        <div class="avatar w-5 h-5 rounded-full bg-gray-500 mr-2"></div>
        <div class="username text-blue-400">{{ username }}</div>
        <div class="timestamp ml-2 text-gray-500">
          Created {{ createdTime }}
        </div>
      </div>
      <div class="actions flex items-center space-x-2">
        <button class="px-2 py-0.5 text-xs border border-gray-700 rounded">
          details
        </button>
        <div class="stars flex items-center">
          <svg
            class="w-3 h-3 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            ></path>
          </svg>
          <span class="ml-1">{{ stars }} stars</span>
        </div>
      </div>
    </div>

    <div class="code-content p-4 font-mono text-sm text-white overflow-auto">
      <pre class="relative"><code class="language-javascript">
<div class="line" v-for="(line, index) in codeLines" :key="index">
  <span class="line-number text-gray-500 mr-4">{{ index + 1 }}</span>
  <span v-html="line"></span>
</div>
      </code></pre>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
  code: {
    type: String,
    default: `function example() {
  const value = "Hello World";
  console.log(value);
  return value;
}`,
  },
  username: {
    type: String,
    default: "@username",
  },
  createdTime: {
    type: String,
    default: "9 months ago",
  },
  stars: {
    type: Number,
    default: 3,
  },
});

// Process code lines with simple syntax highlighting
const codeLines = computed(() => {
  const lines = props.code.split("\n");

  return lines.map((line) => {
    // Simple syntax highlighting (could be enhanced with a proper library)
    return (
      line
        // Keywords
        .replace(
          /(function|const|let|var|return|if|else|for|while|switch|case|break|continue|try|catch|finally|class|import|export|from|as)/g,
          '<span class="text-purple-400">$1</span>'
        )
        // Strings
        .replace(/(["'])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
        // Numbers
        .replace(/\b(\d+)\b/g, '<span class="text-yellow-400">$1</span>')
        // Comments
        .replace(/(\/\/.*$)/g, '<span class="text-gray-500">$1</span>')
        // Function calls
        .replace(/(\w+)(\s*\()/g, '<span class="text-blue-400">$1</span>$2')
        // Properties/methods
        .replace(/(\.)(\w+)/g, '$1<span class="text-cyan-400">$2</span>')
    );
  });
});
</script>

<style scoped>
.line {
  display: flex;
  padding: 0.1rem 0;
  white-space: pre;
}

.line-number {
  min-width: 2rem;
  text-align: right;
  user-select: none;
}

/* Subtle scrollbar */
.code-content {
  max-height: 500px;
}

.code-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-track {
  background: transparent;
}
</style>
