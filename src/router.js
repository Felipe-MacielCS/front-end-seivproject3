import { createRouter, createWebHistory } from "vue-router";

// Auth
import Login from "./views/Login.vue";
import Signup from "./views/Signup.vue";

// Dashboards
import AthleteDashboard from "./views/AthleteDashBoard.vue";
import CoachDashboard from "./views/CoachDashBoard.vue";
import AdminDashboard from "./views/AdminDashBoard.vue";
import AdminAthletes from "./views/AdminAthletes.vue";
import AdminCoaches from "./views/AdminCoaches.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
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
    {
      path: "/admin/athletes",
      name: "adminAthletes",
      component: AdminAthletes,
    },
    {
      path: "/admin/coaches",
      name: "adminCoaches",
      component: AdminCoaches,
    },

    // 404
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login",
    },
  ],
});

export default router;
