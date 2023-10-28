import { createRouter, createWebHistory } from "vue-router";
// pages
import Me from "../pages/me.vue";
import Landing from "../pages/index.vue";
import About from "../pages/about.vue";
import Projects from "../pages/projects.vue";
import Contact from "../pages/contact.vue";

// components
import Maintenance from "../components/maintenance.vue";

const routes = [
  { path: "/me", component: Me, name: "Myself" },

  { path: "/", component: Landing, name: "Landing" },

  { path: "/about", component: About, name: "About Me" },

  { path: "/projects", component: Projects, name: "My projects" },

  { path: "/contact", component: Contact, name: "Contact Me" },

  // maintenance component
  { path: "/maintenance", component: Maintenance, name: "maintenance" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
