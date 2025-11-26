<template>
  <v-container class="results-container" fluid>
    <!-- Title -->
    <v-row justify="center">
      <v-col cols="12">
        <h2 class="results-title text-center font-weight-bold">
          {{ athleteName }}'s Results
        </h2>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12">
        <!-- Top bar: Add Result + Search -->
        <div class="d-flex align-center justify-space-between mb-4">
          <v-btn
            color="black"
            class="text-white"
            prepend-icon="mdi-plus"
            @click="openAddDialog"
          >
            Add Result
          </v-btn>

          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search by exercise"
            variant="outlined"
            density="compact"
            hide-details
            class="w-50 small-input"
          />
        </div>

        <!-- Results table -->
        <v-table class="results-table" density="comfortable">
          <thead>
            <tr>
              <th class="text-left">Date</th>
              <th class="text-left">Exercise / Goal</th>
              <th class="text-left">Result</th>
            </tr>
          </thead>

          <tbody>
            <!-- Loading row -->
            <tr v-if="loading">
              <td colspan="3" class="text-center py-6">
                <v-progress-circular indeterminate color="black" />
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-else-if="filteredResults.length === 0">
              <td colspan="3" class="text-center py-4">
                No results recorded yet.
              </td>
            </tr>

            <!-- Data rows -->
            <tr v-else v-for="r in filteredResults" :key="r.id">
              <td>{{ r.date }}</td>
              <td>{{ r.exerciseName }}</td>
              <td>{{ r.displayValue }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>

    <!-- Add Result Dialog -->
    <v-dialog v-model="addDialog" max-width="420">
      <v-card>
        <v-card-title class="font-weight-bold">
          Add New Result
        </v-card-title>

        <v-card-text>
          <v-select
            v-model="newResult.goalID"
            :items="goalsForAthlete"
            item-title="label"
            item-value="goalID"
            label="Goal *"
            density="compact"
          />

          <v-text-field
            v-model="newResult.recordDate"
            type="date"
            label="Date"
            density="compact"
          />

          <v-text-field
            v-model.number="newResult.value"
            type="number"
            label="Value"
            density="compact"
          />

          <v-textarea
            v-model="newResult.notes"
            label="Notes"
            auto-grow
            rows="2"
            density="compact"
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="addDialog = false">Cancel</v-btn>
          <v-btn color="green" variant="elevated" @click="saveNewResult">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Utils from "../config/utils.js";
import AthleteServices from "../services/athleteServices.js";
import ResultServices from "../services/resultServices.js";
import GoalServices from "../services/goalServices.js";

// ---------- State ----------
const loading = ref(true);
const search = ref("");

const athleteId = ref(null);
const athleteName = ref("Athlete");

const results = ref([]);

// Add Result dialog state
const addDialog = ref(false);
const newResult = ref({
  goalID: null,
  value: null,
  recordDate: new Date().toISOString().slice(0, 10), // yyyy-mm-dd
  notes: "",
});

const goalsForAthlete = ref([]);

// ---------- Load athlete (same logic style as Goals page) ----------
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

// ---------- Load goals for this athlete (for the add-result dropdown) ----------
const fetchGoals = async () => {
  if (!athleteId.value) return;

  const res = await GoalServices.getAll();
  const data = res.data ?? res;

  goalsForAthlete.value = (data || [])
    .filter((g) => g.athleteID === athleteId.value)
    .map((g) => ({
      goalID: g.goalID,
      label: g.type || g.exerciseName || "Goal",
      metric: g.metric || "lb",
    }));
};

// ---------- Load ONLY this athlete's results ----------
const fetchResults = async () => {
  if (!athleteId.value) return;

  // Requires backend route: GET /results/athlete/:athleteId
  const res = await ResultServices.getByAthlete(athleteId.value);
  const data = res.data ?? res;

  results.value = (data || []).map((r) => {
    const goal = r.goal || {};
    const exercise = goal.exercise || {};

    // recordDate from your model
    const rawDate = r.recordDate;
    const dateStr =
      typeof rawDate === "string" ? rawDate.slice(0, 10) : "";

    const value = r.value;
    const metric = goal.metric || "lb";
    const displayValue =
      value != null ? `${value} ${metric}` : "—";

    return {
      id: r.resultID || r.id,
      date: dateStr || "—",
      exerciseName: exercise.name || goal.type || "Exercise",
      value,
      metric,
      displayValue,
      notes: r.notes || "",
    };
  });
};

// ---------- Filtered results for search ----------
const filteredResults = computed(() =>
  results.value.filter((r) =>
    r.exerciseName.toLowerCase().includes(search.value.toLowerCase())
  )
);

// ---------- Add Result handlers ----------
const openAddDialog = () => {
  newResult.value = {
    goalID: null,
    value: null,
    recordDate: new Date().toISOString().slice(0, 10),
    notes: "",
  };
  addDialog.value = true;
};

const saveNewResult = async () => {
  if (!newResult.value.goalID || newResult.value.value == null) {
    alert("Please choose a goal and enter a value.");
    return;
  }

  try {
    const payload = {
      goalID: newResult.value.goalID,
      value: Number(newResult.value.value),
      recordDate:
        newResult.value.recordDate || new Date().toISOString(),
      notes: newResult.value.notes || "",
    };

    const res = await ResultServices.create(payload);
    const created = res.data ?? res;

    const matchingGoal = goalsForAthlete.value.find(
      (g) => g.goalID === payload.goalID
    );

    const rawDate = created.recordDate || payload.recordDate || "";
    const dateStr =
      typeof rawDate === "string" ? rawDate.slice(0, 10) : "";

    const metric = matchingGoal?.metric || "lb";

    // Add new result to top of table
    results.value.unshift({
      id: created.resultID || created.id,
      date: dateStr || "—",
      exerciseName: matchingGoal?.label || "Goal",
      value: payload.value,
      metric,
      displayValue: `${payload.value} ${metric}`,
      notes: payload.notes,
    });

    addDialog.value = false;
  } catch (err) {
    console.error("Error creating result:", err);
  }
};

// ---------- Init page ----------
onMounted(async () => {
  try {
    await loadAthlete();
    await fetchGoals();
    await fetchResults();
  } catch (err) {
    console.error("Error loading athlete results:", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.results-container {
  padding-top: 100px; /* pushes content below navbar */
  padding-bottom: 32px;
  max-width: 100%;
}

.results-title {
  margin-bottom: 24px;
}

.results-table {
  width: 100%;
  background-color: #d9d9d9;
  border-radius: 12px;
}

.small-input {
  max-height: 36px;
  font-size: 0.85rem;
}

.small-input .v-field__input {
  padding: 4px 8px;
}
</style>
