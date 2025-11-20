<template>
  <v-container fluid class="pa-0" style="background-color: #e6f3fa; min-height: 100vh;">

    <v-container class="py-10" style="max-width: 1200px;">
      <!-- Welcome -->
      <h1 class="text-h4 font-weight-bold">Welcome Name</h1>
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
            label="Exercise Plan"
            variant="outlined"
            class="mb-6"
          />

          <!-- Avocado Mascot -->
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
import { ref } from "vue";

const currentDate = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

// Mock data
const results = ref([
  { exercise: "Squat", value: 250 },
  { exercise: "Leg Press", value: 540 },
  { exercise: "Leg Extensions", value: 215 },
  { exercise: "Leg Curls", value: 185 },
  { exercise: "Bulgarian Split Squads", value: 75 },
]);

const goals = ref([
  { exercise: "Squat", value: 350 },
  { exercise: "Bench", value: 250 },
  { exercise: "Dead Lift", value: 400 },
  { exercise: "Leg Press", value: 540 },
  { exercise: "Military Press", value: 135 },
]);

const exercisePlans = ref(["Plan A", "Plan B", "Plan C"]);
const selectedPlan = ref(null);
</script>



<style>
.text-black {
  color: black !important;
}
</style>
