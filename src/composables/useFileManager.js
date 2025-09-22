import { ref, defineAsyncComponent, markRaw, shallowRef } from "vue";

/**
 * Composable for managing file system, icons, and component mappings
 * Centralizes all file-related data and logic
 */
export function useFileManager() {
  // Import all file content components
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
  const TailwindComponent = defineAsyncComponent(() =>
    import("@/components/file-contents/Tailwind.vue")
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

  // File to component mapping
  const fileComponentMap = {
    "bio-index": BioIndexComponent,
    "high-school": HighSchoolComponent,
    university: UniversityComponent,
    threejs: ThreeJSComponent,
    javascript: JavaScriptComponent,
    html: HTMLComponent,
    css: CSSComponent,
    tailwind: TailwindComponent,
    nodejs: NodeJSComponent,
    express: ExpressComponent,
    python: PythonComponent,
    django: DjangoComponent,
    postgres: PostgresComponent,
    docker: DockerComponent,
    aws: AWSComponent,
    git: GitComponent,
  };

  // Get file information by ID - single source of truth
  const getFileInfo = (fileId) => {
    // First check if it's a technology file
    const techFile = technologyFiles.value.find((file) => file.id === fileId);
    if (techFile) {
      return techFile;
    }
    
    // Handle special cases for non-technology files
    const specialFiles = {
      "bio-index": { id: "bio-index", name: "index.me", icon: "markdown.svg" },
      "high-school": { id: "high-school", name: "high-school.md", icon: "markdown.svg" },
      university: { id: "university", name: "university.md", icon: "markdown.svg" },
    };
    
    return specialFiles[fileId] || { id: fileId, name: "unknown", icon: "markdown.svg" };
  };

  // File to icon mapping - leverages getFileInfo for consistency
  const getFileIcon = (fileId) => {
    return getFileInfo(fileId).icon;
  };

  // Technology files with icons
  const technologyFiles = ref([
    { id: "html", name: ".html", icon: "html-icon.svg" },
    { id: "css", name: ".css", icon: "css-icon.svg" },
    { id: "tailwind", name: "tailwind.css", icon: "tailwind-icon.svg" },
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

  // Contacts data
  const contacts = ref([
    { icon: "✉️", label: "gokulspeed@gmail.com", color: "text-blue-400" },
    { icon: "📱", label: "+919924269359", color: "text-green-400" },
  ]);

  // Folder states
  const personalInfoOpen = ref(true);
  const folderStates = ref({
    bio: { open: true },
    interests: { open: true },
    education: { open: true },
  });

  const contactsOpen = ref(true);

  // Open files/tabs management
  const openFiles = ref([]);
  const currentComponent = shallowRef(null);

  // Toggle folder state
  const toggleFolder = (folderId) => {
    if (folderId === "personal-info") {
      personalInfoOpen.value = !personalInfoOpen.value;
    } else if (folderStates.value[folderId]) {
      folderStates.value[folderId].open = !folderStates.value[folderId].open;
    }
  };

  // Toggle contacts section
  const toggleContacts = () => {
    contactsOpen.value = !contactsOpen.value;
  };

  // Check if a file is active
  const isFileActive = (fileId) => {
    return openFiles.value.some((file) => file.id === fileId && file.active);
  };

  // Handle opening a file
  const openFile = (folderId, fileId) => {
    // Get file information using single source of truth
    const fileInfo = getFileInfo(fileId);
    const fileName = fileInfo.name;

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

  return {
    // Data
    technologyFiles,
    contacts,
    personalInfoOpen,
    folderStates,
    contactsOpen,
    openFiles,
    currentComponent,
    
    // Methods
    getFileInfo,
    getFileIcon,
    toggleFolder,
    toggleContacts,
    isFileActive,
    openFile,
    activateFile,
    closeFile,
  };
}
