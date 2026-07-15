import { createRouter, createWebHistory } from "vue-router";
// pages
const Me = () => import("../pages/me.vue");
const Landing = () => import("../pages/index.vue");
const Projects = () => import("../pages/projects.vue");
const Contact = () => import("../pages/contact.vue");

// components
const Maintenance = () => import("../components/maintenance.vue");

const routes = [
  { path: "/me", component: Me, name: "Myself" },

  { path: "/", component: Landing, name: "Landing" },

  { path: "/projects", component: Projects, name: "My projects" },

  { path: "/contact", component: Contact, name: "Contact Me" },

  { path: "/blogs", component: Maintenance, name: "Blogs" },

  // maintenance component
  { path: "/maintenance", component: Maintenance, name: "maintenance" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
