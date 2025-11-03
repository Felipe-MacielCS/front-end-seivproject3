import { createRouter, createWebHistory } from "vue-router";

// Auth
import Login from "./views/Login.vue";
import Signup from "./views/Signup.vue";

// Dashboards
import AthleteDashboard from "./views/AthleteDashBoard.vue";
import CoachDashboard from "./views/CoachDashBoard.vue";
import AdminDashboard from "./views/AdminDashBoard.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- Authentication ---
    {
      path: "/",
      alias: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/signup",
      name: "signup",
      component: Signup,
    },

    // --- Role-Based Dashboards ---
    {
      path: "/athlete",
      name: "athlete",
      component: AthleteDashboard,
      meta: { role: "athlete" },
    },
    {
      path: "/coach",
      name: "coach",
      component: CoachDashboard,
      meta: { role: "coach" },
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminDashboard,
      meta: { role: "admin" },
    },

    // --- Catch-all 404 redirect ---
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login",
    },
  ],
});

export default router;
