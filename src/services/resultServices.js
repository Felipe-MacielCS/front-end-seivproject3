import apiClient from "./services.js";

export default {
  getByAthlete(athleteID) {
    return apiClient.get(`/results/athlete/${athleteID}`);
  },

  create(data) {
    return apiClient.post("/results", data);
  },

  update(id, data) {
    return apiClient.put(`/results/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/results/${id}`);
  }
};
