import { ref, computed } from "vue";

export function useProjects() {
  const projects = ref([
    {
      id: 1,
      title: "_ui-animations",
      description:
        "Modern UI animations library built with React and TypeScript.",
      imageUrl:
        "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/ui-animations",
      projectMeta: {
        tech_used: ["react", "typescript", "css"],
        category: "frontend",
        status: "completed",
        year: 2023,
        liveUrl: "https://ui-animations.example.com",
      },
    },
    {
      id: 2,
      title: "_tetris-game",
      description:
        "Classic Tetris game built with Next.js and Three.js for 3D effects.",
      imageUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/tetris-game",
      projectMeta: {
        tech_used: ["nextjs", "threejs", "typescript"],
        category: "game",
        status: "completed",
        year: 2023,
        liveUrl: "https://tetris-game.example.com",
      },
    },
    {
      id: 3,
      title: "_ethereum-dapp",
      description:
        "Decentralized application for Ethereum blockchain interactions.",
      imageUrl:
        "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/ethereum-dapp",
      projectMeta: {
        tech_used: ["vuejs", "nuxtjs", "javascript"],
        category: "blockchain",
        status: "completed",
        year: 2023,
        liveUrl: "https://ethereum-dapp.example.com",
      },
    },
    {
      id: 4,
      title: "_portfolio-vue",
      description:
        "A modern portfolio website built with Vue.js and Tailwind CSS.",
      imageUrl:
        "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/portfolio-vue",
      projectMeta: {
        tech_used: ["vuejs", "tailwind", "javascript"],
        category: "portfolio",
        status: "completed",
        year: 2024,
        liveUrl: "https://portfolio.example.com",
      },
    },
    {
      id: 5,
      title: "_ecommerce-api",
      description:
        "RESTful API for e-commerce platform built with FastAPI and Python.",
      imageUrl:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/ecommerce-api",
      projectMeta: {
        tech_used: ["fastapi", "python", "postgres", "docker"],
        category: "backend",
        status: "completed",
        year: 2023,
        liveUrl: "https://api.ecommerce.example.com",
      },
    },
    {
      id: 6,
      title: "_data-visualization",
      description:
        "Interactive data visualization dashboard with real-time updates using Three.js.",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/data-viz",
      projectMeta: {
        tech_used: ["react", "threejs", "typescript"],
        category: "data-viz",
        status: "in-progress",
        year: 2024,
        liveUrl: "https://data-viz.example.com",
      },
    },
    {
      id: 7,
      title: "_mobile-app",
      description: "Cross-platform mobile application built with React Native.",
      imageUrl:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/mobile-app",
      projectMeta: {
        tech_used: ["reactnative", "javascript", "express"],
        category: "mobile",
        status: "completed",
        year: 2024,
        liveUrl: "https://mobile-app.example.com",
      },
    },
    {
      id: 8,
      title: "_go-microservice",
      description:
        "High-performance microservice built with Go and deployed on Vercel.",
      imageUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/go-microservice",
      projectMeta: {
        tech_used: ["go", "vercel", "docker"],
        category: "backend",
        status: "completed",
        year: 2024,
        liveUrl: "https://go-microservice.example.com",
      },
    },
  ]);

  const selectedTechs = ref(["react", "vuejs"]);

  const filteredProjects = computed(() => {
    if (selectedTechs.value.length === 0) {
      return projects.value;
    }

    return projects.value.filter((project) =>
      project.projectMeta.tech_used.some((tech) =>
        selectedTechs.value.includes(tech)
      )
    );
  });

  const selectedTechNames = computed(() => {
    const techMap = {
      react: "React",
      nextjs: "Next.js",
      vuejs: "Vue.js",
      nuxtjs: "Nuxt.js",
      nodejs: "Node.js",
      express: "Express.js",
      typescript: "TypeScript",
      javascript: "JavaScript",
      go: "Go",
      django: "Django",
      python: "Python",
      fastapi: "FastAPI",
      vercel: "Vercel",
      reactnative: "React Native",
      threejs: "Three.js",
      html: "HTML",
      css: "CSS",
      postgres: "PostgreSQL",
      docker: "Docker",
      aws: "AWS",
      tailwind: "Tailwind CSS",
      git: "Git",
    };

    return selectedTechs.value.map((tech) => techMap[tech] || tech);
  });

  const updateSelectedTechs = (newTechs) => {
    selectedTechs.value = newTechs;
  };

  return {
    projects,
    selectedTechs,
    filteredProjects,
    selectedTechNames,
    updateSelectedTechs,
  };
}
