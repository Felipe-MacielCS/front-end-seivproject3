<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center text-center">
    <v-card elevation="3" class="pa-8" max-width="600">
      <h1 class="text-h4 font-weight-bold mb-4">🏃 Athlete Dashboard</h1>
      <p class="text-body-1 mb-6">
        Welcome back, {{ user.name }}!  
        Here you can track your training progress and view your performance stats.
      </p>

      <v-btn color="primary" class="ma-2" @click="goToProfile">
        View Profile
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
const user = Utils.getStore("user") || { name: "Athlete" };

const goToProfile = () => {
  alert("Profile feature coming soon!");
};

const logout = () => {
  Utils.removeItem("user");
  Utils.removeToken();
  router.push({ name: "login" });
};
</script>
