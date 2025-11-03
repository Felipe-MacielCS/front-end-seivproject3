<script setup>
import { ref, onMounted } from "vue";
import AuthServices from "../services/authServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref({});

// Initialize Google Login button
const loginWithGoogle = () => {
  window.handleCredentialResponse = handleCredentialResponse;
  const client = import.meta.env.VITE_APP_CLIENT_ID;
  console.log("Google Client ID:", client);

  window.google.accounts.id.initialize({
    client_id: client,
    cancel_on_tap_outside: false,
    auto_select: true,
    callback: window.handleCredentialResponse,
  });

  // Render Google Sign-In button
  window.google.accounts.id.renderButton(document.getElementById("parent_id"), {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signup_with",
    width: 400,
  });
};

// Handle the Google Credential after login
const handleCredentialResponse = async (response) => {
  const token = { credential: response.credential };

  await AuthServices.loginUser(token)
    .then((res) => {
      user.value = res.data;
      console.log("✅ Logged in user:", user.value);

      // Save user to localStorage/session
      Utils.setStore("user", user.value);

      // Optionally store JWT for API requests
      Utils.setToken(user.value.token);

      // Redirect based on role
      if (user.value.isAdmin) {
        router.push({ name: "adminDashboard" });
      } else {
        router.push({ name: "athlete" }); // or "athleteHome"
      }
    })
    .catch((error) => {
      console.error("❌ Login error:", error);
    });
};

onMounted(() => {
  loginWithGoogle();
});
</script>

<template>
  <div class="signup-buttons">
    <v-row justify="center">
      <div id="parent_id"></div>
    </v-row>
  </div>
</template>
