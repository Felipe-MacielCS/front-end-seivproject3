<script setup>
import SocialLogin from "../components/SocialLogin.vue";
</script>

<template>
  <v-container class="fill-height d-flex flex-column justify-center align-center pa-0" style="background-color: #f2f2f2;">

    <v-card
      class="pa-8 mt-12 d-flex flex-column align-center justify-center"
      elevation="5"
      width="600"
      height="300"
      style="background-color: #e0e0e0; border-radius: 16px;"
    >
      <h2 class="mb-6 text-center font-weight-bold">Login</h2>

      <SocialLogin />

      <div class="mt-4 mb-2 text-center font-weight-medium">Or</div>

      <v-btn color="grey-darken-1" variant="elevated" class="text-white px-8" @click="goToSignUp">
        Sign Up
      </v-btn>
    </v-card>
  </v-container>
</template>

<script>
export default {
  methods: {
    goToSignUp() {
      // Replace this with your sign-up route when ready
      this.$router.push("/signup");
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
