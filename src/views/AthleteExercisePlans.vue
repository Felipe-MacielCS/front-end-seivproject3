<script setup>
import { ref, onMounted, computed } from "vue";
import ExercisePlanServices from "../services/exerciseplanServices.js";
import CoachServices from "../services/coachServices.js";

const search = ref("");
const plans = ref([]);
const coaches = ref([]);
const loading = ref(true);


const coachOptions = computed(() =>
  coaches.value.map((c) => ({
    title: c.user?.name || `Coach #${c.coachID}`,
    value: c.coachID,
  }))
);

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
      reps: p.reps ?? null,
      repetitions: p.repetitions ?? null,
      description: p.description || "",
      coachID: p.coachID,
    }));

    console.log("Loaded plans:", plans.value);
  } catch (err) {
    console.error("Error fetching exercise plans:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchCoaches(), fetchPlans()]);
});

const filteredPlans = computed(() =>
  plans.value.filter((p) =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

const viewPlan = (plan) => {
  planToView.value = plan;
  viewDialog.value = true;
};

const confirmDelete = (plan) => {
  planToDelete.value = plan;
  deleteDialog.value = true;
};

const performDelete = async () => {
  try {
    await ExercisePlanServices.delete(planToDelete.value.id);
    plans.value = plans.value.filter((p) => p.id !== planToDelete.value.id);
    console.log("Exercise plan deleted");
  } catch (err) {
    console.error("Delete plan failed:", err);
  } finally {
    deleteDialog.value = false;
  }
};

const confirmEdit = (plan) => {
  planToEdit.value = plan;
  editedPlan.value = { ...plan };
  editDialog.value = true;
};

const saveEdit = async () => {
  if (!editedPlan.value.name?.trim() || !editedPlan.value.coachID) {
    return;
  }

  try {
    await ExercisePlanServices.update(editedPlan.value.id, {
      name: editedPlan.value.name,
      reps: editedPlan.value.reps,
      repetitions: editedPlan.value.repetitions,
      description: editedPlan.value.description,
      coachID: editedPlan.value.coachID,
    });

    const idx = plans.value.findIndex((p) => p.id === editedPlan.value.id);
    if (idx !== -1) {
      plans.value[idx] = { ...editedPlan.value };
    }

    console.log("Exercise plan updated");
  } catch (err) {
    console.error("Update plan failed:", err);
  } finally {
    editDialog.value = false;
  }
};

const openAddDialog = () => {
  newPlan.value = {
    name: "",
    reps: null,
    repetitions: null,
    description: "",
    coachID: null,
  };
  addDialog.value = true;
};

const saveNewPlan = async () => {
  if (!newPlan.value.name?.trim() || !newPlan.value.coachID) {
    return;
  }

  try {
    const res = await ExercisePlanServices.create({
      name: newPlan.value.name,
      reps: newPlan.value.reps,
      repetitions: newPlan.value.repetitions,
      description: newPlan.value.description,
      coachID: newPlan.value.coachID,
    });

    const p = res.data ?? res;

    plans.value.push({
      id: p.planID,
      name: p.name || "Untitled Plan",
      reps: p.reps ?? null,
      repetitions: p.repetitions ?? null,
      description: p.description || "",
      coachID: p.coachID,
    });

    console.log("Exercise plan created");
    addDialog.value = false;
  } catch (err) {
    console.error("Create plan failed:", err);
  }
};
</script>

<template>
  <v-container class="plans-container" fluid>
    <v-row justify="center" class="mt-10">
      <v-col cols="12">

        <div class="d-flex align-center justify-end mb-4">
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

        <!-- Table -->
        <v-table class="plans-table" density="comfortable">
          <thead>
            <tr>
              <th class="text-left">Plan Name</th>
              <th class="text-left">Coach</th>
            </tr>
          </thead>

          <tbody>
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="2" class="text-center py-6">
                <v-progress-circular indeterminate color="black" />
              </td>
            </tr>

            <!-- Rows -->
            <tr
              v-else
              v-for="plan in filteredPlans"
              :key="plan.id"
              @click="viewPlan(plan)"
              style="cursor: pointer;"
            >
              <td>{{ plan.name }}</td>
              <td>{{ getCoachName(plan.coachID) }}</td>
            </tr>
          </tbody>
        </v-table>

        <!-- View dialog ONLY -->
        <v-dialog v-model="viewDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              Plan Details
            </v-card-title>

            <v-card-text>
              <v-list density="compact">
                <v-list-item><strong>Name:</strong> {{ planToView?.name }}</v-list-item>
                <v-list-item><strong>Coach:</strong> {{ getCoachName(planToView?.coachID) }}</v-list-item>
                <v-list-item><strong>Reps:</strong> {{ planToView?.reps ?? "—" }}</v-list-item>
                <v-list-item><strong>Repetitions:</strong> {{ planToView?.repetitions ?? "—" }}</v-list-item>
                <v-list-item><strong>Description:</strong> {{ planToView?.description || "—" }}</v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn color="grey" variant="outlined" @click="viewDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

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
