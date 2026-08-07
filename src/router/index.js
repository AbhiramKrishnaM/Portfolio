import { createRouter, createWebHistory } from "vue-router";
// pages
const Me = () => import("../pages/me.vue");
const Landing = () => import("../pages/index.vue");

// components
const Maintenance = () => import("../components/maintenance.vue");

const routes = [
  { path: "/me", component: Me, name: "Myself" },

  { path: "/", component: Landing, name: "Landing" },

  // maintenance component
  { path: "/maintenance", component: Maintenance, name: "maintenance" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
