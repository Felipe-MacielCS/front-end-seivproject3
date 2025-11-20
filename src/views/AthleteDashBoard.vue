<template>
  <v-container fluid class="pa-0" style="background-color: #e6f3fa; min-height: 100vh;">

    <v-container class="py-10" style="max-width: 1200px;">
      <!-- Welcome -->
       <v-container class="dashboard-container" fluid>
          <h2 class="text-center mb-10 font-weight-bold"></h2>
      </v-container>
      <h1 class="dashboard-container font-weight-bold">Welcome {{ user.name }}!</h1>
      <p class="text-subtitle-1 mb-6">Pick an exercise plan and let's get started!</p>

      <!-- Date -->
      <h2 class="text-h5 font-weight-bold mb-8">{{ currentDate }}</h2>

      <v-row justify="center" align="start" no-gutters>
        
        <!-- Left Results Panel -->
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

        <!-- Center Exercise Plan + Image -->
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

        <!-- Right Goals Panel -->
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
import Utils from "../config/utils";

import ExercisePlanServices from "../services/exerciseplanServices.js";
import goalServices from "../services/goalServices.js";
import resultServices from "../services/resultServices.js";

const user = Utils.getStore("user") || { name: "Athlete" };

const currentDate = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});


const results = ref([
  { exercise: "No data", value: "--" }
]);

const loadResults = async (athleteID) => {
  try {
    const res = await resultServices.getByAthlete(athleteID);
    const data = res.data ?? [];

    if (!data.length) {
      results.value = [{ exercise: "No data", value: "--" }];
      return;
    }

    results.value = data.map((r) => ({
      exercise: r.exerciseName || r.exercise || "Exercise",
      value: r.value || r.weight || "--",
    }));

  } catch (err) {
    console.error("Error loading results:", err);
    results.value = [{ exercise: "No data", value: "--" }];
  }
};


const goals = ref([
  { exercise: "No goals found", value: "--" }
]);

const loadGoals = async (athleteID) => {
  try {
    const res = await goalServices.getByAthlete(athleteID);
    const data = res.data ?? [];

    if (!data.length) {
      goals.value = [{ exercise: "No goals found", value: "--" }];
      return;
    }

    goals.value = data.slice(0, 5).map((g) => ({
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
    const data = res.data;   // <-- FIXED

    console.log("RAW RESPONSE:", res);
    console.log("DATA:", res.data);


    exercisePlans.value = (data || []).map((p) => ({
      id: p.planID,
      name: p.name || "Untitled Plan",
    }));

    console.log("Loaded ALL plans:", exercisePlans.value);

  } catch (err) {
    console.error("Error loading all exercise plans:", err);
  } finally {
    loadingPlans.value = false;
  }
  
};


onMounted(async () => {
  const storedUser = Utils.getStore("user");
  const athleteID = storedUser?.athleteID;

  console.log("Stored user:", storedUser);
console.log("Athlete ID:", storedUser?.athleteID);


  if (!athleteID) {
    console.error("Athlete ID missing in localStorage");
    return;
  }

  // Load everything together
  await Promise.all([
    fetchAllPlans(),
    loadGoals(athleteID),
    loadResults(athleteID)
  ]);
});
</script>



<style>
.text-black {
  color: black !important;
}

</style>
