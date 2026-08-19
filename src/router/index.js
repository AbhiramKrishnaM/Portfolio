import { createRouter, createWebHistory } from "vue-router";
// pages
const Landing = () => import("../pages/index.vue");

// components
const Maintenance = () => import("../components/maintenance.vue");

const routes = [
  {
    path: "/",
    component: Landing,
    name: "Landing",
    meta: { title: "Fullstack Engineer" },
  },

  // maintenance component
  {
    path: "/maintenance",
    component: Maintenance,
    name: "maintenance",
    meta: { title: "Coming Soon", robots: "noindex" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = to.meta.title ? `Abhi.dev — ${to.meta.title}` : "Abhi.dev";

  let robotsTag = document.querySelector("meta[name=robots]");
  if (to.meta.robots) {
    if (!robotsTag) {
      robotsTag = document.createElement("meta");
      robotsTag.setAttribute("name", "robots");
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute("content", to.meta.robots);
  } else if (robotsTag) {
    robotsTag.remove();
  }
});

export default router;
