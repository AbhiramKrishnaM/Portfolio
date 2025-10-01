<template>
  <div
    class="desktop-layout bg-[#011627] text-white min-h-screen flex flex-col box-border"
  >
    <!-- Main Content Area -->
    <div class="main-content flex-1 flex">
      <!-- Left side icons column -->
      <div
        class="icons-column w-12 border-r border-[#1E2D3D] flex flex-col items-center py-4"
      >
        <div
          class="icon-btn p-2 mb-4 cursor-pointer"
          @click="setActiveIcon('hobbies')"
        >
          <img
            src="/icons/hobbies-icon.svg"
            class="w-5 h-5"
            :class="{
              'opacity-100': activeIcon === 'hobbies',
              'opacity-40': activeIcon !== 'hobbies',
            }"
            alt="Hobbies"
          />
        </div>
        <div
          class="icon-btn p-2 mb-4 cursor-pointer"
          @click="setActiveIcon('professional')"
        >
          <img
            src="/icons/professional-info-icon.svg"
            class="w-5 h-5"
            :class="{
              'opacity-100': activeIcon === 'professional',
              'opacity-40': activeIcon !== 'professional',
            }"
            alt="Professional Info"
          />
        </div>
        <div
          class="icon-btn p-2 mb-4 cursor-pointer"
          @click="setActiveIcon('personal')"
        >
          <img
            src="/icons/personal-info-icon.svg"
            class="w-5 h-5"
            :class="{
              'opacity-100': activeIcon === 'personal',
              'opacity-40': activeIcon !== 'personal',
            }"
            alt="Personal Info"
          />
        </div>
      </div>

      <!-- Content container with sidebar and editor -->
      <div class="vs-code-container flex flex-1">
        <!-- Sidebar/Explorer -->
        <div class="sidebar w-[263px] border-r border-[#1E2D3D] flex flex-col">
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
          <div
            class="file-tabs flex items-center justify-start border-b border-border-white h-12 flex-shrink-0"
          >
            <div
              v-for="(file, index) in openFiles"
              :key="index"
              class="file-tab px-4 flex items-center gap-2 text-sm border-r border-border-white h-full cursor-pointer"
              :class="{ 'bg-[#1E2D3D]': file.active }"
              @click="activateFile(file.id)"
            >
              <!-- File icon -->
              <div class="file-icon w-4 h-4 flex-shrink-0">
                <img
                  :src="`/icons/${getFileIcon(file.id)}`"
                  class="w-full h-full"
                  :alt="file.name"
                />
              </div>
              <!-- File name -->
              <span class="text-xs md:text-sm text-accent-color font-mono">{{
                file.name
              }}</span>
              <!-- Close button -->
              <button
                class="p-0.5 hover:opacity-70 transition-opacity duration-200 flex-shrink-0"
                @click.stop="closeFile(file.id)"
                aria-label="Close file"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M9 3L3 9M3 3L9 9"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
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
import { onMounted, ref } from "vue";
import { useFileManager } from "@/composables/useFileManager";

// Active icon state
const activeIcon = ref("professional"); // Default to professional icon

// Function to set active icon
const setActiveIcon = (iconName) => {
  activeIcon.value = iconName;
};

// Use the file manager composable
const {
  technologyFiles,
  contacts,
  personalInfoOpen,
  folderStates,
  contactsOpen,
  openFiles,
  currentComponent,
  getFileIcon,
  toggleFolder,
  toggleContacts,
  isFileActive,
  openFile,
  activateFile,
  closeFile,
} = useFileManager();

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
