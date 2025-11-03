<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center text-center">
    <v-card elevation="3" class="pa-8" max-width="600">
      <h1 class="text-h4 font-weight-bold mb-4">🧑‍💼 Admin Dashboard</h1>
      <p class="text-body-1 mb-6">
        Welcome Admin {{ user.name }}!  
        You can manage users, view system logs, and oversee platform operations.
      </p>

      <v-btn color="primary" class="ma-2" @click="manageUsers">
        Manage Users
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
const user = Utils.getStore("user") || { name: "Admin" };

const manageUsers = () => {
  alert("User management page coming soon!");
};

const logout = () => {
  Utils.removeItem("user");
  Utils.removeToken();
  router.push({ name: "login" });
};
</script>
