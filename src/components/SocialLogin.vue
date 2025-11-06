<script setup>
import { ref, onMounted } from "vue";
import AuthServices from "../services/authServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref({});
const loading = ref(false);

// Initialize Google Sign-Up button
const initGoogleSignUp = () => {
  window.handleCredentialResponse = handleCredentialResponse;
  const client = import.meta.env.VITE_APP_CLIENT_ID;
  console.log("Google Client ID:", client);

  window.google.accounts.id.initialize({
    client_id: client,
    cancel_on_tap_outside: false,
    auto_select: false,
    callback: window.handleCredentialResponse,
  });

  // Render the button inside the div
  window.google.accounts.id.renderButton(document.getElementById("parent_id"), {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signup_with",
    width: 400,
  });
};

// Handle the Google Credential after signup
const handleCredentialResponse = async (response) => {
  loading.value = true;

  // Get chosen role from sessionStorage (set in SignUp.vue)
  const role = sessionStorage.getItem("signupRole") || "athlete";

  // Build payload for backend
  const token = {
    credential: response.credential,
    isAthlete: role === "athlete",
    isCoach: role === "coach",
  };

  try {
    const res = await AuthServices.loginUser(token);
    user.value = res.data;
    console.log("✅ Signed up user:", user.value);

    // Save locally
    Utils.setStore("user", user.value);
    Utils.setToken(user.value.token);

    if (window.updateUserState) window.updateUserState();

    // Redirect based on role
    if (user.value.isAdmin) {
      router.push({ name: "admin" });
    } else if (role === "athlete") {
      router.push({ name: "athlete" });
    } else {
      router.push({ name: "coach" });
    }
  } catch (error) {
    console.error("❌ Signup error:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initGoogleSignUp();
});
</script>

<template>
  <div class="signup-buttons">
    <v-row justify="center">
      <div id="parent_id"></div>
    </v-row>

    <!-- Loading Overlay -->
    <v-dialog v-model="loading" persistent width="300">
      <v-card class="pa-6 text-center">
        <v-progress-circular indeterminate color="primary" size="40" />
        <p class="mt-4 mb-0">Signing you in...</p>
      </v-card>
    </v-dialog>
  </div>
</template>
