<template>
  <DesktopLayout>
    <div class="code-display grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      <!-- Left Side - About Me Information -->
      <div class="about-me-text text-white">
        <div class="code-editor font-mono">
          <div class="line-numbers">
            <div v-for="n in 19" :key="n" class="line-number text-gray-500">
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
                * I am Abhiram Krishna M, a software engineer from</span
              >
            </div>
            <div class="line-4">
              <span class="text-blue-300">
                * Kozhikode, Kerala, India. I hold a Bachelor's degree</span
              >
            </div>
            <div class="line-5">
              <span class="text-blue-300">
                * in Computer Science from MES College of Engineering,</span
              >
            </div>
            <div class="line-6">
              <span class="text-blue-300">
                * Kuttippuram, where I discovered my passion for</span
              >
            </div>
            <div class="line-7">
              <span class="text-blue-300">
                * building user interfaces during my final year.</span
              >
            </div>
            <div class="line-8"><span class="text-blue-300"> * </span></div>
            <div class="line-9">
              <span class="text-blue-300">
                * My professional journey began with an internship</span
              >
            </div>
            <div class="line-10">
              <span class="text-blue-300">
                * at Neolen, a startup in Ghaziabad, where I gained</span
              >
            </div>
            <div class="line-11">
              <span class="text-blue-300">
                * hands-on experience with React and React Native.</span
              >
            </div>
            <div class="line-12">
              <span class="text-blue-300">
                * This early exposure to modern JavaScript frameworks</span
              >
            </div>
            <div class="line-13">
              <span class="text-blue-300">
                * sparked my deep interest in frontend development</span
              >
            </div>
            <div class="line-14">
              <span class="text-blue-300"> * and mobile applications.</span>
            </div>
            <div class="line-15">
              <span class="text-blue-300">
                * Currently, I serve as a Software Engineer at</span
              >
            </div>
            <div class="line-16">
              <span class="text-blue-300">
                * Discern Security, where I continue to work with</span
              >
            </div>
            <div class="line-17">
              <span class="text-blue-300">
                * React.js and Nuxt.js while expanding my expertise</span
              >
            </div>
            <div class="line-18">
              <span class="text-blue-300"> * into Django REST Framework.</span>
            </div>
            <div class="line-19"><span class="text-blue-300"> */</span></div>
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
