<template>
  <div class="desktop-layout text-white min-h-screen flex flex-col">
    <!-- Main Content Area -->
    <div class="main-content flex-1 flex">
      <!-- Sidebar -->
      <div class="sidebar w-64 border-r border-[#1E2D3D]/40 flex flex-col">
        <!-- Sidebar sections -->
        <div
          v-for="(section, index) in activeSections"
          :key="index"
          class="section"
        >
          <div
            class="section-header p-2 flex items-center cursor-pointer"
            @click="toggleSection(section.id)"
          >
            <span class="transform" :class="section.open ? 'rotate-90' : ''"
              >▶</span
            >
            <span class="ml-2">{{ section.name }}</span>
          </div>

          <!-- Section content -->
          <div v-if="section.open" class="section-content pl-4">
            <div
              v-for="(item, i) in section.items"
              :key="i"
              class="item p-2 flex items-center text-sm cursor-pointer hover:bg-[#1E2D3D]/20"
            >
              <div class="icon w-5 mr-2" :class="item.color">
                {{ item.icon }}
              </div>
              <div>{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area flex-1 overflow-auto">
        <div class="relative w-full h-full">
          <!-- Slot for page-specific content -->
          <slot></slot>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="footer border-t border-[#1E2D3D]/40 p-2 flex justify-between text-xs"
    >
      <div class="find-me flex items-center">
        find me in:
        <a href="#" class="ml-2 p-1"
          ><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.54 8.54 0 0 1-5.3 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
            /></svg
        ></a>
        <a href="#" class="p-1"
          ><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"
            /></svg
        ></a>
      </div>
      <div class="source">@username</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// Define tabs and set active based on current route
const tabs = ref([
  { name: "hello", route: "/", active: false },
  { name: "about-me", route: "/about", active: false },
  { name: "projects", route: "/projects", active: false },
  { name: "contact-me", route: "/contact", active: false },
]);

// Update active tab based on current route
const updateActiveTabs = () => {
  tabs.value.forEach((tab) => {
    tab.active = tab.route === route.path;
  });
};

// Handle tab activation
const activateTab = (path) => {
  router.push(path);
};

// Sidebar sections with expandable content
const sections = ref([
  {
    id: "personal-info",
    name: "personal-info",
    open: true,
    items: [
      { icon: "📄", label: "bio", color: "text-blue-400" },
      { icon: "⭐", label: "interests", color: "text-green-400" },
      { icon: "🎓", label: "education", color: "text-purple-400" },
      { icon: "🏫", label: "high-school", color: "text-blue-400" },
      { icon: "🏢", label: "university", color: "text-orange-400" },
    ],
  },
  {
    id: "contacts",
    name: "contacts",
    open: false,
    items: [
      { icon: "✉️", label: "gokulspeed@gmail.com", color: "text-blue-400" },
      { icon: "📱", label: "+919924269359", color: "text-green-400" },
    ],
  },
]);

// Handle section toggle
const toggleSection = (sectionId) => {
  const section = sections.value.find((s) => s.id === sectionId);
  if (section) {
    section.open = !section.open;
  }
};

// Get active sections
const activeSections = computed(() => {
  return sections.value;
});

// Update active tab when route changes
onMounted(() => {
  updateActiveTabs();
});

// Watch for route changes to update active tab
router.afterEach(() => {
  updateActiveTabs();
});
</script>

<style scoped>
.active-tab {
  background-color: #011627;
}

.section-header .transform {
  transition: transform 0.2s ease;
}

.desktop-layout {
  font-family: "Fira Code", monospace;
}

/* Add a subtle line number effect for code-like appearance */
.section-content .item {
  position: relative;
}

.section-content .item:before {
  content: attr(data-line);
  position: absolute;
  left: -20px;
  color: #607b96;
  font-size: 0.8rem;
  opacity: 0.6;
}
</style>
