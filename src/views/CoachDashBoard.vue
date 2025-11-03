<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center text-center">
    <v-card elevation="3" class="pa-8" max-width="600">
      <h1 class="text-h4 font-weight-bold mb-4">🏋️ Coach Dashboard</h1>
      <p class="text-body-1 mb-6">
        Hello Coach {{ user.name }}!  
        Manage your athletes, review workouts, and track performance metrics.
      </p>

      <v-btn color="primary" class="ma-2" @click="manageAthletes">
        Manage Athletes
      </v-btn>
      <v-btn color="secondary" class="ma-2" @click="logout">
        Logout
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const user = Utils.getStore("user") || { name: "Coach" };

const manageAthletes = () => {
  alert("Athlete management page coming soon!");
};

const logout = () => {
  Utils.removeItem("user");
  Utils.removeToken();
  router.push({ name: "login" });
};
</script>
