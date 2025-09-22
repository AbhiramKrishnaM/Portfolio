<template>
  <div
    class="desktop-layout bg-[#011627] text-white min-h-screen flex flex-col box-border"
  >
    <!-- Main Content Area -->
    <div class="main-content flex-1 flex">
      <!-- Left side icons column -->
      <div
        class="icons-column w-12 bg-[#011627] border-r border-[#1E2D3D] flex flex-col items-center py-4"
      >
        <div class="icon-btn p-2 mb-4 cursor-pointer">
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 12h18M3 6h18M3 18h18"
            />
          </svg>
        </div>
        <div class="icon-btn p-2 mb-4 cursor-pointer text-blue-400">
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <div class="icon-btn p-2 mb-4 cursor-pointer">
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <!-- Content container with sidebar and editor -->
      <div class="vs-code-container flex flex-1">
        <!-- Sidebar/Explorer -->
        <div class="sidebar w-60 border-r border-[#1E2D3D] flex flex-col">
          <!-- Main folder - personal-info -->
          <div class="folder">
            <div
              class="folder-header py-1 px-2 flex items-center cursor-pointer"
              @click="toggleFolder('personal-info')"
            >
              <img
                :src="
                  personalInfoOpen
                    ? '/icons/down-arrow-outline.svg'
                    : '/icons/right-arrow-outline.svg'
                "
                class="w-3 h-3 mr-2"
                alt="Arrow"
              />
              <span class="ml-1">personal-info</span>
            </div>

            <!-- Nested folders -->
            <div v-if="personalInfoOpen" class="folder-content pl-3">
              <!-- Bio folder -->
              <div class="folder">
                <div
                  class="folder-header py-1 px-2 flex items-center cursor-pointer"
                  @click="toggleFolder('bio')"
                >
                  <img
                    :src="
                      folderStates.bio.open
                        ? '/icons/down-arrow-outline.svg'
                        : '/icons/right-arrow-outline.svg'
                    "
                    class="w-3 h-3 mr-2"
                    alt="Arrow"
                  />
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      :style="{ color: '#E99287' }"
                    >
                      <path
                        d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                      />
                    </svg>
                    <span>bio</span>
                  </div>
                </div>

                <!-- Bio files -->
                <div v-if="folderStates.bio.open" class="folder-content pl-3">
                  <div
                    class="file-item py-1 px-2 flex items-center text-sm cursor-pointer hover:bg-[#1E2D3D]/40"
                    :class="{ 'bg-[#1E2D3D]/40': isFileActive('bio-index') }"
                    @click="openFile('bio', 'bio-index')"
                  >
                    <div class="file-icon w-4 h-4 mr-2">
                      <img
                        :src="`/icons/${getFileIcon('bio-index')}`"
                        class="w-full h-full"
                        alt="index.me"
                      />
                    </div>
                    <div>index.me</div>
                  </div>
                </div>
              </div>

              <!-- Interests folder -->
              <div class="folder">
                <div
                  class="folder-header py-1 px-2 flex items-center cursor-pointer"
                  @click="toggleFolder('interests')"
                >
                  <img
                    :src="
                      folderStates.interests.open
                        ? '/icons/down-arrow-outline.svg'
                        : '/icons/right-arrow-outline.svg'
                    "
                    class="w-3 h-3 mr-2"
                    alt="Arrow"
                  />
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      :style="{ color: '#43D9AD' }"
                    >
                      <path
                        d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                      />
                    </svg>
                    <span>interests</span>
                  </div>
                </div>

                <!-- Interests files -->
                <div
                  v-if="folderStates.interests.open"
                  class="folder-content pl-3"
                >
                  <div
                    v-for="file in technologyFiles"
                    :key="file.id"
                    class="file-item py-1 px-2 flex items-center text-sm cursor-pointer hover:bg-[#1E2D3D]/40"
                    :class="{ 'bg-[#1E2D3D]/40': isFileActive(file.id) }"
                    @click="openFile('interests', file.id)"
                  >
                    <div class="file-icon w-4 h-4 mr-2">
                      <img
                        :src="`/icons/${file.icon || 'default-file.svg'}`"
                        class="w-full h-full"
                      />
                    </div>
                    <div>{{ file.name }}</div>
                  </div>
                </div>
              </div>

              <!-- Education folder -->
              <div class="folder">
                <div
                  class="folder-header py-1 px-2 flex items-center cursor-pointer"
                  @click="toggleFolder('education')"
                >
                  <img
                    :src="
                      folderStates.education.open
                        ? '/icons/down-arrow-outline.svg'
                        : '/icons/right-arrow-outline.svg'
                    "
                    class="w-3 h-3 mr-2"
                    alt="Arrow"
                  />
                  <div class="flex items-center">
                    <svg
                      class="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      :style="{ color: '#3A49A4' }"
                    >
                      <path
                        d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                      />
                    </svg>
                    <span>education</span>
                  </div>
                </div>

                <!-- Education files -->
                <div
                  v-if="folderStates.education.open"
                  class="folder-content pl-3"
                >
                  <div
                    class="file-item py-1 px-2 flex items-center text-sm cursor-pointer hover:bg-[#1E2D3D]/40"
                    :class="{ 'bg-[#1E2D3D]/40': isFileActive('high-school') }"
                    @click="openFile('education', 'high-school')"
                  >
                    <div class="file-icon w-4 h-4 mr-2">
                      <img
                        :src="`/icons/${getFileIcon('high-school')}`"
                        class="w-full h-full"
                        alt="high-school.md"
                      />
                    </div>
                    <div>high-school.md</div>
                  </div>
                  <div
                    class="file-item py-1 px-2 flex items-center text-sm cursor-pointer hover:bg-[#1E2D3D]/40"
                    :class="{ 'bg-[#1E2D3D]/40': isFileActive('university') }"
                    @click="openFile('education', 'university')"
                  >
                    <div class="file-icon w-4 h-4 mr-2">
                      <img
                        :src="`/icons/${getFileIcon('university')}`"
                        class="w-full h-full"
                        alt="university.md"
                      />
                    </div>
                    <div>university.md</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contacts section -->
          <div class="contacts-section">
            <div
              class="section-header py-1 px-2 flex items-center cursor-pointer"
              @click="toggleContacts"
            >
              <img
                :src="
                  contactsOpen
                    ? '/icons/down-arrow-outline.svg'
                    : '/icons/right-arrow-outline.svg'
                "
                class="w-3 h-3 mr-2"
                alt="Arrow"
              />
              <span class="ml-1">contacts</span>
            </div>

            <div v-if="contactsOpen" class="section-content pl-5">
              <div
                v-for="(contact, i) in contacts"
                :key="i"
                class="contact-item py-1 px-2 flex items-center text-sm"
              >
                <div class="icon w-5 mr-2" :class="contact.color">
                  {{ contact.icon }}
                </div>
                <div>{{ contact.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Editor Area -->
        <div class="editor-area flex-1 flex flex-col">
          <!-- Open File Tabs -->
          <div class="file-tabs flex border-b border-[#1E2D3D]/70">
            <div
              v-for="(file, index) in openFiles"
              :key="index"
              class="file-tab px-3 py-2 flex items-center text-sm border-r border-[#1E2D3D]/70 cursor-pointer"
              :class="{ 'bg-[#1E2D3D]': file.active }"
              @click="activateFile(file.id)"
            >
              <!-- File icon -->
              <div class="file-icon w-4 h-4 mr-2 flex-shrink-0">
                <img
                  :src="`/icons/${getFileIcon(file.id)}`"
                  class="w-full h-full"
                  :alt="file.name"
                />
              </div>
              <!-- File name -->
              <span class="text-sm">{{ file.name }}</span>
              <!-- Close button -->
              <button
                class="ml-2 text-gray-500 hover:text-white flex-shrink-0"
                @click.stop="closeFile(file.id)"
              >
                <span class="text-xs">×</span>
              </button>
            </div>
          </div>

          <!-- Content Area -->
          <div class="content-area flex-1 overflow-auto">
            <div class="code-editor-container h-full overflow-auto">
              <component :is="currentComponent" v-if="currentComponent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent, markRaw, shallowRef, onMounted } from "vue";

// Import file content components
const BioIndexComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/BioIndex.vue")
);
const HighSchoolComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/HighSchool.vue")
);
const UniversityComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/University.vue")
);
const ThreeJSComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/ThreeJS.vue")
);
const JavaScriptComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/JavaScript.vue")
);
const HTMLComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/HTML.vue")
);
const CSSComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/CSS.vue")
);
const NodeJSComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/NodeJS.vue")
);
const ExpressComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/Express.vue")
);
const PythonComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/Python.vue")
);
const DjangoComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/Django.vue")
);
const PostgresComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/Postgres.vue")
);
const DockerComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/Docker.vue")
);
const AWSComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/AWS.vue")
);
const GitComponent = defineAsyncComponent(() =>
  import("@/components/file-contents/Git.vue")
);

// Folder states
const personalInfoOpen = ref(true);
const folderStates = ref({
  bio: { open: true },
  interests: { open: false },
  education: { open: false },
});

// Toggle folder state
const toggleFolder = (folderId) => {
  if (folderId === "personal-info") {
    personalInfoOpen.value = !personalInfoOpen.value;
  } else if (folderStates.value[folderId]) {
    folderStates.value[folderId].open = !folderStates.value[folderId].open;
  }
};

// Technology files with icons
const technologyFiles = ref([
  { id: "html", name: ".html", icon: "html-icon.svg" },
  { id: "css", name: ".css", icon: "css-icon.svg" },
  { id: "javascript", name: "javascript.js", icon: "javascript-icon.svg" },
  { id: "threejs", name: "threejs.js", icon: "threejs-icon.svg" },
  { id: "nodejs", name: "nodejs.js", icon: "nodejs-icon.svg" },
  { id: "express", name: "express.js", icon: "express-icon.svg" },
  { id: "python", name: "python.py", icon: "python-icon.svg" },
  { id: "django", name: "django.py", icon: "django-icon.svg" },
  { id: "postgres", name: "postgres.sql", icon: "postgres-icon.svg" },
  { id: "docker", name: "docker.md", icon: "docker-icon.svg" },
  { id: "aws", name: "aws.md", icon: "aws-icon.svg" },
  { id: "git", name: "git.md", icon: "git-icon.svg" },
]);

// Contacts
const contacts = ref([
  { icon: "✉️", label: "gokulspeed@gmail.com", color: "text-blue-400" },
  { icon: "📱", label: "+919924269359", color: "text-green-400" },
]);

const contactsOpen = ref(false);

// Toggle contacts section
const toggleContacts = () => {
  contactsOpen.value = !contactsOpen.value;
};

// Open files/tabs management
const openFiles = ref([]);
const currentComponent = shallowRef(null);

// Check if a file is active
const isFileActive = (fileId) => {
  return openFiles.value.some((file) => file.id === fileId && file.active);
};

// File to component mapping
const fileComponentMap = {
  "bio-index": BioIndexComponent,
  "high-school": HighSchoolComponent,
  university: UniversityComponent,
  threejs: ThreeJSComponent,
  javascript: JavaScriptComponent,
  html: HTMLComponent,
  css: CSSComponent,
  nodejs: NodeJSComponent,
  express: ExpressComponent,
  python: PythonComponent,
  django: DjangoComponent,
  postgres: PostgresComponent,
  docker: DockerComponent,
  aws: AWSComponent,
  git: GitComponent,
};

// File to icon mapping
const getFileIcon = (fileId) => {
  const iconMap = {
    "bio-index": "markdown.svg",
    "high-school": "markdown.svg",
    university: "markdown.svg",
    html: "html-icon.svg",
    css: "css-icon.svg",
    javascript: "javascript-icon.svg",
    threejs: "threejs-icon.svg",
    nodejs: "nodejs-icon.svg",
    express: "express-icon.svg",
    python: "python-icon.svg",
    django: "django-icon.svg",
    postgres: "postgres-icon.svg",
    docker: "docker-icon.svg",
    aws: "aws-icon.svg",
    git: "git-icon.svg",
  };

  return iconMap[fileId] || "markdown.svg";
};

// Handle opening a file
const openFile = (folderId, fileId) => {
  // Get file name from either technologyFiles or use hardcoded names for other files
  let fileName = "";

  if (folderId === "bio" && fileId === "bio-index") {
    fileName = "index.me";
  } else if (folderId === "education") {
    fileName = fileId === "high-school" ? "high-school.md" : "university.md";
  } else {
    // Find in technology files
    const techFile = technologyFiles.value.find((f) => f.id === fileId);
    if (techFile) {
      fileName = techFile.name;
    }
  }

  // Check if file is already open
  const existingFileIndex = openFiles.value.findIndex((f) => f.id === fileId);

  if (existingFileIndex !== -1) {
    // If already open, just activate it
    activateFile(fileId);
  } else {
    // Add to open files
    openFiles.value.push({
      id: fileId,
      name: fileName,
      active: false,
      folderId: folderId,
    });

    // Activate the newly opened file
    activateFile(fileId);
  }

  // Set the component for this file
  if (fileComponentMap[fileId]) {
    currentComponent.value = markRaw(fileComponentMap[fileId]);
  }
};

// Activate a specific file tab
const activateFile = (fileId) => {
  openFiles.value.forEach((file) => {
    file.active = file.id === fileId;

    // If this file is now active, set its component
    if (file.active && fileComponentMap[fileId]) {
      currentComponent.value = markRaw(fileComponentMap[fileId]);
    }
  });
};

// Close a file tab
const closeFile = (fileId) => {
  const fileIndex = openFiles.value.findIndex((file) => file.id === fileId);

  if (fileIndex !== -1) {
    const wasActive = openFiles.value[fileIndex].active;

    // Remove the file
    openFiles.value.splice(fileIndex, 1);

    // If the closed file was active and there are other files open,
    // activate another file
    if (wasActive && openFiles.value.length > 0) {
      // Activate the next file, or the previous if it was the last
      const newIndex =
        fileIndex < openFiles.value.length
          ? fileIndex
          : openFiles.value.length - 1;
      activateFile(openFiles.value[newIndex].id);
    } else if (openFiles.value.length === 0) {
      // If no files are open, clear the current component
      currentComponent.value = null;
    }
  }
};

// Initialize with bio/index.me open by default
onMounted(() => {
  openFile("bio", "bio-index");
});
</script>

<style scoped>
.desktop-layout {
  font-family: "Fira Code", monospace;
  background-color: #011627;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.file-tab {
  transition: background-color 0.2s ease;
}

.file-tab:hover {
  background-color: rgba(30, 45, 61, 0.8);
}
</style>
