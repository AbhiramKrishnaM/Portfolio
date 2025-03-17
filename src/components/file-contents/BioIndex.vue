<template>
  <div class="file-content flex">
    <!-- Line numbers column styled like VS Code (with border removed) -->
    <div
      class="line-numbers py-3 text-right text-[#607B96] select-none"
      style="min-width: 50px"
    >
      <div
        v-for="n in 16"
        :key="n"
        class="line-number px-2 h-[24px] flex items-center justify-end"
      >
        {{ n }}
      </div>
    </div>

    <!-- File content with proper VS Code-like spacing -->
    <div class="code-content py-3 pl-4 text-blue-300">
      <div class="code-line h-[24px] flex items-center">/**</div>
      <div class="code-line h-[24px] flex items-center">* About me</div>
      <div class="code-line h-[24px] flex items-center">
        * I have 5 years of experience in web
      </div>
      <div class="code-line h-[24px] flex items-center">
        * development lorem ipsum dolor sit amet,
      </div>
      <div class="code-line h-[24px] flex items-center">
        * consectetur adipiscing elit, sed do eiusmod
      </div>
      <div class="code-line h-[24px] flex items-center">
        * tempor incididunt ut labore et dolore
      </div>
      <div class="code-line h-[24px] flex items-center">
        * magna aliqua. Ut enim ad minim veniam,
      </div>
      <div class="code-line h-[24px] flex items-center">*</div>
      <div class="code-line h-[24px] flex items-center">
        * quis nostrud exercitation ullamco laboris
      </div>
      <div class="code-line h-[24px] flex items-center">
        * nisi ut aliquip ex ea commodo consequat.
      </div>
      <div class="code-line h-[24px] flex items-center">*</div>
      <div class="code-line h-[24px] flex items-center">
        * Duis aute irure dolor in reprehenderit in
      </div>
      <div class="code-line h-[24px] flex items-center">
        * voluptate velit esse cillum dolore eu fugiat
      </div>
      <div class="code-line h-[24px] flex items-center">
        * nulla pariatur. Excepteur sint occaecat
      </div>
      <div class="code-line h-[24px] flex items-center">
        * officia deserunt mollit anim id est laborum.
      </div>
      <div class="code-line h-[24px] flex items-center">*/</div>
    </div>
  </div>
</template>

<style scoped>
.file-content {
  font-family: "Fira Code", monospace;
  font-size: 14px;
}

.line-number {
  font-size: 12px;
  color: #607b96;
}

/* Optional: add a subtle highlight on hover like VS Code does */
.code-line:hover {
  background-color: rgba(30, 45, 61, 0.4);
}
</style>
