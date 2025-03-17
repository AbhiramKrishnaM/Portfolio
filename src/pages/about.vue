<template>
  <DesktopLayout>
    <div class="code-display grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      <!-- Left Side - About Me Information -->
      <div class="about-me-text text-white">
        <div class="code-editor font-mono">
          <div class="line-numbers">
            <div v-for="n in 17" :key="n" class="line-number text-gray-500">
              {{ n }}
            </div>
          </div>
          <div class="code-content">
            <div class="line-1"><span class="text-blue-300">/**</span></div>
            <div class="line-2">
              <span class="text-blue-300"> * About me</span>
            </div>
            <div class="line-3">
              <span class="text-blue-300">
                * I have 5 years of experience in web</span
              >
            </div>
            <div class="line-4">
              <span class="text-blue-300">
                * development lorem ipsum dolor sit amet,</span
              >
            </div>
            <div class="line-5">
              <span class="text-blue-300">
                * consectetur adipiscing elit, sed do eiusmod</span
              >
            </div>
            <div class="line-6">
              <span class="text-blue-300">
                * tempor incididunt ut labore et dolore</span
              >
            </div>
            <div class="line-7">
              <span class="text-blue-300">
                * magna aliqua. Ut enim ad minim veniam.</span
              >
            </div>
            <div class="line-8"><span class="text-blue-300"> * </span></div>
            <div class="line-9">
              <span class="text-blue-300">
                * quis nostrud exercitation ullamco laboris</span
              >
            </div>
            <div class="line-10">
              <span class="text-blue-300">
                * nisi ut aliquip ex ea commodo consequat.</span
              >
            </div>
            <div class="line-11"><span class="text-blue-300"> * </span></div>
            <div class="line-12">
              <span class="text-blue-300">
                * Duis aute irure dolor in reprehenderit in</span
              >
            </div>
            <div class="line-13">
              <span class="text-blue-300">
                * voluptate velit esse cillum dolore eu fugiat</span
              >
            </div>
            <div class="line-14">
              <span class="text-blue-300">
                * nulla pariatur. Excepteur sint occaecat</span
              >
            </div>
            <div class="line-15">
              <span class="text-blue-300">
                * officia deserunt mollit anim id est laborum.</span
              >
            </div>
            <div class="line-16"><span class="text-blue-300"> */</span></div>
          </div>
        </div>
      </div>

      <!-- Right Side - Code Snippet Showcase -->
      <div class="code-snippets space-y-6">
        <CodeSnippet
          :username="'@username'"
          :created-time="'9 months ago'"
          :stars="3"
          :code="sampleCode1"
        />

        <CodeSnippet
          :username="'@username'"
          :created-time="'9 months ago'"
          :stars="8"
          :code="sampleCode2"
        />
      </div>
    </div>
  </DesktopLayout>
</template>

<script setup>
import DesktopLayout from "@/layouts/DesktopLayout.vue";
import CodeSnippet from "@/components/CodeSnippet.vue";
import { ref } from "vue";

// Sample code for the snippets
const sampleCode1 = ref(`function initializeModelChunks(chunks, modelChunks) {
  const value = T = parseModel(chunks, response, chunks_value);
  const initializeModel = initializeModelResponse(chunks, any);
  initializeChunk.status = INITIALIZED;
  initializeChunk.value = value;
  
  return value;
}`);

const sampleCode2 = ref(`export function parseModelToggle(
  response: Response,
  value: {[key: string]: JSONValue} | ShownValueArray<JSONValue>,
): any {
  const tuple: [mixed, mixed, mixed, mixed] = <tuple: any>;
  // ... more code ...
}`);
</script>

<style scoped>
.code-editor {
  display: flex;
  background-color: #011627;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow: auto;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  padding-right: 1rem;
  text-align: right;
  user-select: none;
}

.code-content {
  flex: 1;
  font-family: "Fira Code", monospace;
}

.code-content div {
  min-height: 1.5rem;
  padding: 0.1rem 0;
}
</style>
