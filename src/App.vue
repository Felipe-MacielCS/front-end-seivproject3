<script setup>
import { ref, computed, onMounted } from "vue";
import Utils from "./config/utils";
import AdminNavBar from "./components/AdminNavBar.vue";
import CoachNavBar from "./components/CoachNavBar.vue";
import MenuBar from "./components/MenuBar.vue";
import AthleteNavBar from "./components/AthleteNavBar.vue";

const user = ref(Utils.getStore("user"));

window.addEventListener("storage", () => {
  user.value = Utils.getStore("user");
});

window.updateUserState = () => {
  user.value = Utils.getStore("user");
};

const showAdminNavBar = computed(() => user.value && user.value.isAdmin);
const showCoachNavBar = computed(() => user.value && user.value.isCoach);
const showAthleteNavBar = computed(() => user.value && user.value.userID);
const showMenuBar = computed(() => !user.value);

</script>

<template>
  <v-app>
    <AdminNavBar v-if="showAdminNavBar" />
    <MenuBar v-else-if="showMenuBar" />
    <CoachNavBar v-else-if="showCoachNavBar" />
    <AthleteNavBar v-else-if="showAthleteNavBar" />
    <router-view />
  </v-app>
</template>
