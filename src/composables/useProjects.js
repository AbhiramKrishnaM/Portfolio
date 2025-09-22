import { ref, computed } from 'vue'

export function useProjects() {
  const projects = ref([
    {
      id: 1,
      title: "_ui-animations",
      description: "Duis aute irure dolor in velit esse cillum dolore.",
      imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/ui-animations",
      projectMeta: {
        tech_used: ['react', 'css', 'javascript'],
        category: 'frontend',
        status: 'completed',
        year: 2023,
        liveUrl: 'https://ui-animations.example.com'
      }
    },
    {
      id: 2,
      title: "_tetris-game",
      description: "Duis aute irure dolor in velit esse cillum dolore.",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/tetris-game",
      projectMeta: {
        tech_used: ['react', 'javascript', 'css'],
        category: 'game',
        status: 'completed',
        year: 2023,
        liveUrl: 'https://tetris-game.example.com'
      }
    },
    {
      id: 3,
      title: "_ethereum",
      description: "Duis aute irure dolor in velit esse cillum dolore.",
      imageUrl: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/ethereum",
      projectMeta: {
        tech_used: ['vuejs', 'javascript', 'nodejs'],
        category: 'blockchain',
        status: 'completed',
        year: 2023,
        liveUrl: 'https://ethereum.example.com'
      }
    },
    {
      id: 4,
      title: "_portfolio-vue",
      description: "A modern portfolio website built with Vue.js and Tailwind CSS.",
      imageUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/portfolio-vue",
      projectMeta: {
        tech_used: ['vuejs', 'tailwind', 'javascript'],
        category: 'portfolio',
        status: 'completed',
        year: 2024,
        liveUrl: 'https://portfolio.example.com'
      }
    },
    {
      id: 5,
      title: "_ecommerce-api",
      description: "RESTful API for e-commerce platform with authentication and payment integration.",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/ecommerce-api",
      projectMeta: {
        tech_used: ['nodejs', 'express', 'postgres', 'docker'],
        category: 'backend',
        status: 'completed',
        year: 2023,
        liveUrl: 'https://api.ecommerce.example.com'
      }
    },
    {
      id: 6,
      title: "_data-visualization",
      description: "Interactive data visualization dashboard with real-time updates.",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center",
      githubUrl: "https://github.com/example/data-viz",
      projectMeta: {
        tech_used: ['react', 'd3', 'css', 'javascript'],
        category: 'data-viz',
        status: 'in-progress',
        year: 2024,
        liveUrl: 'https://data-viz.example.com'
      }
    }
  ])

  const selectedTechs = ref(['react', 'vuejs'])

  const filteredProjects = computed(() => {
    if (selectedTechs.value.length === 0) {
      return projects.value
    }
    
    return projects.value.filter(project => 
      project.projectMeta.tech_used.some(tech => 
        selectedTechs.value.includes(tech)
      )
    )
  })

  const selectedTechNames = computed(() => {
    const techMap = {
      'react': 'React',
      'vuejs': 'Vue',
      'angular': 'Angular',
      'html': 'HTML',
      'css': 'CSS',
      'javascript': 'JavaScript',
      'nodejs': 'Node.js',
      'python': 'Python',
      'django': 'Django',
      'express': 'Express',
      'postgres': 'PostgreSQL',
      'docker': 'Docker',
      'aws': 'AWS',
      'tailwind': 'Tailwind CSS',
      'threejs': 'Three.js',
      'git': 'Git'
    }
    
    return selectedTechs.value.map(tech => techMap[tech] || tech)
  })

  const updateSelectedTechs = (newTechs) => {
    selectedTechs.value = newTechs
  }

  return {
    projects,
    selectedTechs,
    filteredProjects,
    selectedTechNames,
    updateSelectedTechs
  }
}
