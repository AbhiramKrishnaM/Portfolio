<template>
  <div
    class="px-6 border-b border-border-white flex items-center justify-between"
  >
    <ul class="flex items-center">
      <li class="py-3.5 border-r border-border-white">
        <RouterLink class="nav-link" to="/me" active-class="active">
          abhiram-krishna
        </RouterLink>
      </li>

      <li class="py-3.5 border-r border-border-white">
        <RouterLink class="nav-link" to="/" active-class="active">
          _hello
        </RouterLink>
      </li>
      <li class="py-3.5 border-r border-border-white">
        <RouterLink class="nav-link" to="/about" active-class="active">
          _about-me
        </RouterLink>
      </li>
      <li class="py-3.5 border-r border-border-white">
        <RouterLink class="nav-link" to="/projects" active-class="active">
          _projects
        </RouterLink>
      </li>
    </ul>

    <div class="flex w-[186px]">
      <a href="#" class="p-3.5 border-l border-border-white">
        <RouterLink class="nav-link" to="/contact" active-class="active">
          _contact-me
        </RouterLink>
      </a>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
/* General link styling */
.nav-link {
  position: relative;
  padding: 0 1em; /* Adjust as needed */
  text-decoration: none;
  cursor: pointer;
  overflow: hidden; /* Ensures the underline doesn't overflow outside the link */
}

/* Underline styling */
.nav-link::before {
  content: "";
  position: absolute;
  bottom: -15px; /* Position underline at the bottom */
  left: 0;
  width: 0; /* Initially no width */
  height: 2px; /* Thickness of underline */
  background-color: #fea55f; /* Color of underline */
  transition: width 0.3s; /* Animation transition */
}

/* Active state, full underline */
.nav-link.active::before {
  width: 100%;
}
</style>
