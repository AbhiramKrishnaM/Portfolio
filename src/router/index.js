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
    meta: { title: "Coming Soon" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = to.meta.title ? `Abhi.dev — ${to.meta.title}` : "Abhi.dev";
});

export default router;
