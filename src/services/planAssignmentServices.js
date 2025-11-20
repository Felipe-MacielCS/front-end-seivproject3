import apiClient from "./services.js";

export default {
  getAssignedPlans(athleteID) {
    return apiClient.get(`/planassignments/athlete/${athleteID}`);
  }
};
