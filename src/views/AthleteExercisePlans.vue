<script setup>
import { ref, computed, onMounted } from "vue";

import ExercisePlanServices from "../services/exerciseplanServices.js";
import CoachServices from "../services/coachServices.js";
import ExerciseServices from "../services/exerciseServices.js";
import ExercisePoolServices from "../services/exercisepoolServices.js";

// ---------- state ----------
const search = ref("");
const plans = ref([]);
const coaches = ref([]);
const loading = ref(true);

const exercises = ref([]);
const poolEntries = ref([]);

// view plan details
const viewDialog = ref(false);
const planToView = ref(null);

// view plan exercises (read-only)
const manageDialog = ref(false);
const planForExercises = ref(null);

// ---------- helpers ----------

const getCoachName = (coachID) => {
  const coach = coaches.value.find((c) => c.coachID === coachID);
  return coach ? coach.user?.name || `Coach #${coachID}` : `Coach #${coachID}`;
};

const fetchCoaches = async () => {
  try {
    const res = await CoachServices.getAll();
    const data = res.data ?? res;
    coaches.value = data || [];
    console.log("Loaded coaches:", coaches.value);
  } catch (err) {
    console.error("Error fetching coaches:", err);
  }
};

const fetchPlans = async () => {
  loading.value = true;
  try {
    const res = await ExercisePlanServices.getAll();
    const data = res.data ?? res;

    plans.value = (data || []).map((p) => ({
      id: p.planID,
      name: p.name || "Untitled Plan",
      description: p.description || "",
      coachID: p.coachID,
    }));

    console.log("Loaded ALL plans for athlete view:", plans.value);
  } catch (err) {
    console.error("Error fetching exercise plans:", err);
  } finally {
    loading.value = false;
  }
};

const fetchExercises = async () => {
  try {
    const res = await ExerciseServices.getAll();
    const data = res.data ?? res;
    exercises.value = data || [];
    console.log("Loaded exercises for pool:", exercises.value);
  } catch (err) {
    console.error("Error fetching exercises:", err);
  }
};

const fetchPoolEntries = async () => {
  try {
    const res = await ExercisePoolServices.getAll();
    const data = res.data ?? res;
    poolEntries.value = data || [];
    console.log("Loaded exercise pool entries:", poolEntries.value);
  } catch (err) {
    console.error("Error fetching exercise pool entries:", err);
  }
};

// which exercises belong to the currently selected plan
const planExercises = computed(() => {
  if (!planForExercises.value) return [];
  return poolEntries.value
    .filter((pe) => pe.planID === planForExercises.value.id)
    .map((pe) => {
      const ex = exercises.value.find((e) => e.exerciseID === pe.exerciseID);
      return {
        planID: pe.planID,
        exerciseID: pe.exerciseID,
        sets: pe.sets,
        repetitions: pe.repetitions,
        exerciseName: ex?.name || `Exercise #${pe.exerciseID}`,
      };
    });
});

// filter plans by search
const filteredPlans = computed(() =>
  plans.value.filter((p) =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

// ---------- UI handlers ----------

const viewPlan = (plan) => {
  planToView.value = plan;
  viewDialog.value = true;
};

const openViewExercises = (plan) => {
  planForExercises.value = plan;
  manageDialog.value = true;
};

// ---------- init ----------

onMounted(async () => {
  await fetchCoaches();
  await Promise.all([fetchPlans(), fetchExercises(), fetchPoolEntries()]);
});
</script>

<template>
  <v-container class="plans-container" fluid>
    <v-row justify="center" class="mt-10">
      <v-col cols="12">
        <!-- Top bar: search only, no add button -->
        <div class="d-flex align-center justify-space-between mb-4">
          <span></span>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search Plan"
            density="compact"
            variant="outlined"
            hide-details
            class="w-50 small-input"
          />
        </div>

        <!-- Plans table -->
        <v-table class="plans-table" density="comfortable">
          <thead>
            <tr>
              <th class="text-left">Plan Name</th>
              <th class="text-left">Coach</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="3" class="text-center py-6">
                <v-progress-circular indeterminate color="black" />
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="filteredPlans.length === 0">
              <td colspan="3" class="text-center py-4">
                No exercise plans available yet.
              </td>
            </tr>

            <!-- Data rows -->
            <tr v-else v-for="plan in filteredPlans" :key="plan.id">
              <td>{{ plan.name }}</td>
              <td>{{ getCoachName(plan.coachID) }}</td>
              <td class="text-right">
                <!-- View plan details -->
                <v-btn
                  icon="mdi-account-details-outline"
                  size="small"
                  color="black"
                  variant="text"
                  @click="viewPlan(plan)"
                />
                <!-- View exercises in plan (read-only) -->
                <v-btn
                  icon="mdi-clipboard-list-outline"
                  size="small"
                  color="black"
                  variant="text"
                  @click="openViewExercises(plan)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- View Plan Details Dialog -->
        <v-dialog v-model="viewDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              Plan Details
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <strong>Name:</strong> {{ planToView?.name }}
                </v-list-item>
                <v-list-item>
                  <strong>Coach:</strong>
                  {{ planToView ? getCoachName(planToView.coachID) : "" }}
                </v-list-item>
                <v-list-item>
                  <strong>Description:</strong>
                  {{ planToView?.description || "—" }}
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn color="grey" variant="outlined" @click="viewDialog = false">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- View Plan Exercises (read-only) -->
        <v-dialog v-model="manageDialog" max-width="700">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              Exercises in Plan — {{ planForExercises?.name }}
            </v-card-title>

            <v-card-text>
              <v-table density="comfortable">
                <thead>
                  <tr>
                    <th>Exercise</th>
                    <th class="text-center">Sets</th>
                    <th class="text-center">Reps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="planExercises.length === 0">
                    <td colspan="3" class="text-center py-4">
                      No exercises in this plan yet.
                    </td>
                  </tr>
                  <tr
                    v-for="entry in planExercises"
                    :key="entry.planID + '-' + entry.exerciseID"
                  >
                    <td>{{ entry.exerciseName }}</td>
                    <td class="text-center">{{ entry.sets }}</td>
                    <td class="text-center">{{ entry.repetitions }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                color="grey"
                variant="outlined"
                @click="manageDialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <div class="text-right mt-3">
          <v-btn
            text
            class="text-grey-darken-2 text-decoration-underline"
            variant="plain"
          >
            View More
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.plans-container {
  padding-top: 50px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding-left: 2;
  padding-right: 2;
}

.plans-table {
  width: 100%;
  max-width: 100%;
  background-color: #d9d9d9;
  border-radius: 12px;
  margin: 20px auto;
}

th {
  font-weight: 700;
  color: black;
  background-color: #d9d9d9;
  text-align: left;
  padding: 12px;
}

td {
  background-color: #d9d9d9;
  border-top: 1px solid #bdbdbd;
}

.v-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.small-input {
  max-height: 36px;
  font-size: 0.85rem;
}

.small-input .v-field__input {
  padding: 4px 8px;
}
</style>
