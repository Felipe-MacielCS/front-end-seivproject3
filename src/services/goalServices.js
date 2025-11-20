import apiClient from "./services.js";

export default {
  getByAthlete(athleteID) {
    return apiClient.get(`/goals/athlete/${athleteID}`);
  },

  create(data) {
    return apiClient.post("/goals", data);
  },

  update(id, data) {
    return apiClient.put(`/goals/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/goals/${id}`);
  }
};
