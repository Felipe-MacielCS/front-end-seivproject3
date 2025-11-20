<script setup>
import { useRouter } from "vue-router";



const router = useRouter();

// Navigate to selected section
const goTo = (path) => {
  router.push(path);
};
</script>

<template>
  <v-container class="dashboard-container" fluid>
    <h2 class="text-center mb-10 font-weight-bold">Athlete Results</h2>
  </v-container>
</template>

<style scoped>
.dashboard-container {
  padding-top: 120px;
  padding-bottom: 50px;
}
h3 {
  font-size: 1.3rem;
  color: #000;
  margin-bottom: 16px;
}
.v-btn:hover {
  background-color: #bdbdbd !important;
}
</style>
