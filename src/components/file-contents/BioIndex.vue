<template>
  <div class="file-content flex">
    <!-- Line numbers -->
    <div class="line-numbers py-4 pr-2 text-right text-gray-500 select-none">
      <div v-for="n in 16" :key="n" class="text-xs px-2">{{ n }}</div>
    </div>

    <!-- File content -->
    <div class="code-content py-4 pl-4">
      <pre class="font-mono text-blue-300 whitespace-pre">
/**
 * About me
 * I have 5 years of experience in web
 * development lorem ipsum dolor sit amet,
 * consectetur adipiscing elit, sed do eiusmod
 * tempor incididunt ut labore et dolore
 * magna aliqua. Ut enim ad minim veniam,
 * 
 * quis nostrud exercitation ullamco laboris
 * nisi ut aliquip ex ea commodo consequat.
 * 
 * Duis aute irure dolor in reprehenderit in
 * voluptate velit esse cillum dolore eu fugiat
 * nulla pariatur. Excepteur sint occaecat
 * officia deserunt mollit anim id est laborum.
 */</pre
      >
    </div>
  </div>
</template>
