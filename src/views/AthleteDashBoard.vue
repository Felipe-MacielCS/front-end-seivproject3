<template>
  <v-container fluid class="pa-0" style="background-color: #e6f3fa; min-height: 100vh;">

    <v-container class="py-10" style="max-width: 1200px;">
     
       <v-container class="dashboard-container" fluid>
          <h2 class="text-center mb-10 font-weight-bold"></h2>
      </v-container>
      <h1 class="dashboard-container font-weight-bold">Welcome {{ athleteName }}!</h1>
      <p class="text-subtitle-1 mb-6">Pick an exercise plan and let's get started!</p>

      <h2 class="text-h5 font-weight-bold mb-8">{{ currentDate }}</h2>

      <v-row justify="center" align="start" no-gutters>
        
        <v-col cols="12" md="4" class="pa-2">
          <v-card color="#bcd1dc" class="pa-6 rounded-lg" elevation="2">
            <h3 class="text-h6 font-weight-bold mb-4">Result from that date:</h3>

            <div v-for="(item, idx) in results" :key="idx"
                 class="d-flex justify-space-between my-3 text-body-1">
              <span>{{ item.exercise }}</span>
              <span class="font-weight-bold">{{ item.value }} LB</span>
            </div>

          </v-card>
        </v-col>

        <v-col cols="12" md="4" class="pa-2 text-center">
          
          <!-- Play Button -->
          <v-btn color="black" icon class="mb-4">
            <v-icon>mdi-play-circle</v-icon>
          </v-btn>

          <!-- Dropdown -->
          <v-select
             v-model="selectedPlan"
            :items="exercisePlans"
            item-title="name"
            item-value="id"
            label="Exercise Plan"
            variant="outlined"
            class="mb-6"
            :loading="loadingPlans"
          />
          

          <img
            src=""
            width="160"
            alt="mascot"
          />
        </v-col>

        <v-col cols="12" md="4" class="pa-2">
          <v-card color="#bcd1dc" class="pa-6 rounded-lg" elevation="2">
            <h3 class="text-h6 font-weight-bold mb-4">Top 5 Goals:</h3>

            <div v-for="(item, idx) in goals" :key="idx"
                 class="d-flex justify-space-between my-3 text-body-1">
              <span>{{ item.exercise }}</span>
              <span class="font-weight-bold">{{ item.value }} LB</span>
            </div>

          </v-card>
        </v-col>

      </v-row>
    </v-container>

  </v-container>
</template>


<script setup>
import { ref, onMounted } from "vue";
import Utils from "../config/utils.js";

import AthleteServices from "../services/athleteServices.js";
import ExercisePlanServices from "../services/exerciseplanServices.js";
import GoalServices from "../services/goalServices.js";
import ResultServices from "../services/resultServices.js";


const athleteId = ref(null);
const athleteName = ref("Athlete");

const storedUser = Utils.getStore("user") || null;

const currentDate = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const results = ref([{ exercise: "No data", value: "--" }]);

const loadResults = async () => {
  if (!athleteId.value) return;

  try {
    const res = await ResultServices.getAll();        
    const data = res.data ?? res;

    const athleteResults = (data || []).filter(
      (r) => r.athleteID === athleteId.value
    );

    if (!athleteResults.length) {
      results.value = [{ exercise: "No data", value: "--" }];
      return;
    }

    results.value = athleteResults.map((r) => ({
      exercise: r.exerciseName || r.exercise || "Exercise",
      value: r.value || r.weight || "--",
    }));
  } catch (err) {
    console.error("Error loading results:", err);
    results.value = [{ exercise: "No data", value: "--" }];
  }
};

const goals = ref([{ exercise: "No goals found", value: "--" }]);

const loadGoals = async () => {
  if (!athleteId.value) return;
  try {
    const res = await GoalServices.getAll();        
    const data = res.data ?? res;

    const athleteGoals = (data || []).filter(
      (g) => g.athleteID === athleteId.value
    );

    if (!athleteGoals.length) {
      goals.value = [{ exercise: "No goals found", value: "--" }];
      return;
    }

    goals.value = athleteGoals.slice(0, 5).map((g) => ({
      exercise: g.type || g.exerciseName || "Goal",
      value: g.target || "--",
    }));
  } catch (err) {
    console.error("Error loading goals:", err);
    goals.value = [{ exercise: "No goals found", value: "--" }];
  }
};

const exercisePlans = ref([]);
const selectedPlan = ref(null);
const loadingPlans = ref(true);

const fetchAllPlans = async () => {
  loadingPlans.value = true;
  try {
    const res = await ExercisePlanServices.getAll();
    const data = res.data ?? res;                     

    exercisePlans.value = (data || []).map((p) => ({
      id: p.planID || p.id,
      name: p.name || "Untitled Plan",
    }));

    console.log("Loaded ALL plans:", exercisePlans.value);
  } catch (err) {
    console.error("Error loading all exercise plans:", err);
    exercisePlans.value = [];
  } finally {
    loadingPlans.value = false;
  }
};

const loadAthlete = async () => {
  const user = Utils.getStore("user");

  if (!user) {
    console.error("No logged-in user found in local storage.");
    return;
  }

  const res = await AthleteServices.getAll();
  const list = res.data ?? res;

  const athlete = (list || []).find((a) => a.userID === user.userID);

  if (athlete) {
    athleteId.value = athlete.athleteID;
    athleteName.value = athlete.user?.name || user.name || "Athlete";
  } else {
    console.warn("Could not find athlete record for userID:", user.userID);
  }
};

onMounted(async () => {
  try {
    await loadAthlete();
    await fetchAllPlans();
    if (!athleteId.value) {
      console.error("Athlete ID still missing after loadAthlete.");
      return;
    }

    await Promise.all([loadGoals(), loadResults()]);
  } catch (err) {
    console.error("Error loading athlete dashboard:", err);
  }
});
</script>
