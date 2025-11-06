<script setup>
import { ref, computed, onMounted } from "vue";
import Utils from "./config/utils";
import AdminNavBar from "./components/AdminNavBar.vue";
import MenuBar from "./components/MenuBar.vue";

const user = ref(Utils.getStore("user"));

window.addEventListener("storage", () => {
  user.value = Utils.getStore("user");
});

window.updateUserState = () => {
  user.value = Utils.getStore("user");
};

const showAdminNavBar = computed(() => user.value && user.value.isAdmin);
const showMenuBar = computed(() => !user.value);
</script>

<template>
  <v-app>
    <AdminNavBar v-if="showAdminNavBar" />
    <MenuBar v-else-if="showMenuBar" />
    <router-view />
  </v-app>
</template>
