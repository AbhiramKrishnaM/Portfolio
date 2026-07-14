import { createRouter, createWebHistory } from "vue-router";
// pages
import Me from "../pages/me.vue";
import Landing from "../pages/index.vue";
import Projects from "../pages/projects.vue";
import Contact from "../pages/contact.vue";

// components
import Maintenance from "../components/maintenance.vue";

const routes = [
  { path: "/me", component: Me, name: "Myself" },

  { path: "/", component: Landing, name: "Landing" },

  { path: "/projects", component: Projects, name: "My projects" },

  { path: "/contact", component: Contact, name: "Contact Me" },

  // placeholder nav routes — swap for real pages later
  { path: "/menus", component: Maintenance, name: "Menus" },
  { path: "/wine-list", component: Maintenance, name: "Wine List" },
  { path: "/chefs-story", component: Maintenance, name: "Chef's Story" },
  { path: "/reservations", component: Maintenance, name: "Reservations" },
  { path: "/gallery", component: Maintenance, name: "Gallery" },

  // maintenance component
  { path: "/maintenance", component: Maintenance, name: "maintenance" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
