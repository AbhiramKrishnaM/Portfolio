import { createRouter, createWebHistory } from "vue-router";
// pages
import Landing from "../pages/index.vue";
import About from "../pages/about.vue";
import Projects from "../pages/projects.vue";
import Contact from "../pages/contact.vue";

// components
import Maintenance from "../components/maintenance.vue";

const routes = [
  { path: "/", component: Landing, name: "Landing" },

  { path: "/maintenance", component: Maintenance, name: "maintenance" },

  { path: "/about", component: About, name: "About Me" },

  { path: "/projects", component: Projects, name: "My projects" },

  { path: "/contact", component: Contact, name: "Contact Me" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
