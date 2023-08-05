import { createRouter, createWebHistory } from "vue-router";

import Landing from "../pages/index.vue";
import Maintenance from "../components/maintenance.vue";

const routes = [
  { path: "/", component: Landing, name: "Landing" },

  { path: "/maintenance", component: Maintenance, name: "maintenance" },
  //   { path: "/about", component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
