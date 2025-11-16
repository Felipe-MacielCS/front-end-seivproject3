<script setup>
import { ref, onMounted, computed } from "vue";
import ExercisePlanServices from "../services/exercisePlanServices.js";
import CoachServices from "../services/coachServices.js";

const search = ref("");
const plans = ref([]);
const coaches = ref([]);
const loading = ref(true);

const deleteDialog = ref(false);
const planToDelete = ref(null);

const editDialog = ref(false);
const planToEdit = ref(null);
const editedPlan = ref({});

const viewDialog = ref(false);
const planToView = ref(null);

const addDialog = ref(false);
const newPlan = ref({
  name: "",
  reps: null,
  repetitions: null,
  description: "",
  coachID: null,
});

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
        <div class="d-flex align-center justify-space-between mb-4">
          <v-btn
            color="black"
            class="text-white"
            prepend-icon="mdi-plus"
            @click="openAddDialog"
          >
            Add Exercise Plan
          </v-btn>

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
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading row -->
            <tr v-if="loading">
              <td colspan="3" class="text-center py-6">
                <v-progress-circular indeterminate color="black" />
              </td>
            </tr>

            <!-- Data rows -->
            <tr
              v-else
              v-for="plan in filteredPlans"
              :key="plan.id"
            >
              <td>{{ plan.name }}</td>
              <td>{{ getCoachName(plan.coachID) }}</td>
              <td class="text-right">
                <v-btn
                  icon="mdi-account-details-outline"
                  size="small"
                  color="black"
                  variant="text"
                  @click="viewPlan(plan)"
                />
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="black"
                  variant="text"
                  @click="confirmEdit(plan)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="black"
                  variant="text"
                  @click="confirmDelete(plan)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Delete dialog -->
        <v-dialog v-model="deleteDialog" max-width="400">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              Delete Exercise Plan
            </v-card-title>
            <v-card-text>
              <p>Are you sure you want to delete this plan?</p>
              <p><strong>Plan Name:</strong> {{ planToDelete?.name }}</p>
              <p>
                <strong>Coach:</strong>
                {{ planToDelete ? getCoachName(planToDelete.coachID) : "" }}
              </p>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                color="grey"
                variant="outlined"
                @click="deleteDialog = false"
              >
                Cancel
              </v-btn>
              <v-btn color="red" variant="elevated" @click="performDelete">
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Edit dialog -->
        <v-dialog v-model="editDialog" max-width="520">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              Edit — {{ planToEdit?.name }}
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="editedPlan.name"
                label="Plan Name *"
                density="compact"
              />
              <v-select
                v-model="editedPlan.coachID"
                :items="coachOptions"
                label="Coach *"
                density="compact"
                variant="outlined"
              />
              <v-text-field
                v-model="editedPlan.reps"
                label="Reps (optional)"
                type="number"
                density="compact"
              />
              <v-text-field
                v-model="editedPlan.repetitions"
                label="Repetitions (optional)"
                type="number"
                density="compact"
              />
              <v-textarea
                v-model="editedPlan.description"
                label="Description"
                rows="3"
                density="compact"
              />
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                color="grey"
                variant="outlined"
                @click="editDialog = false"
              >
                Cancel
              </v-btn>
              <v-btn color="green" variant="elevated" @click="saveEdit">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Add dialog -->
        <v-dialog v-model="addDialog" max-width="520">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              Add Exercise Plan
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="newPlan.name"
                label="Plan Name *"
                density="compact"
                required
              />
              <v-select
                v-model="newPlan.coachID"
                :items="coachOptions"
                label="Coach *"
                density="compact"
                variant="outlined"
              />
              <v-text-field
                v-model="newPlan.reps"
                label="Reps (optional)"
                type="number"
                density="compact"
              />
              <v-text-field
                v-model="newPlan.repetitions"
                label="Repetitions (optional)"
                type="number"
                density="compact"
              />
              <v-textarea
                v-model="newPlan.description"
                label="Description"
                rows="3"
                density="compact"
              />
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                color="grey"
                variant="outlined"
                @click="addDialog = false"
              >
                Cancel
              </v-btn>
              <v-btn color="green" variant="elevated" @click="saveNewPlan">
                Add
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- View dialog -->
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
                  <strong>Reps:</strong>
                  {{ planToView?.reps ?? "—" }}
                </v-list-item>
                <v-list-item>
                  <strong>Repetitions:</strong>
                  {{ planToView?.repetitions ?? "—" }}
                </v-list-item>
                <v-list-item>
                  <strong>Description:</strong>
                  {{ planToView?.description || "—" }}
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                color="grey"
                variant="outlined"
                @click="viewDialog = false"
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
