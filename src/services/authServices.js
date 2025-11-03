import apiClient from "./services.js";

export default {
  // Google login
  loginUser(credential) {
    // Send the Google credential object { credential: <token> }
    return apiClient.post("login", credential);
  },

  // Placeholder authorize (if needed later)
  authorizeUser(id) {
    return apiClient.post(`authorize/${id}`);
  },

  // Logout user
  logoutUser() {
    return apiClient.post("logout");
  },
};
