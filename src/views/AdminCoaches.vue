<script setup>
import { ref, onMounted } from "vue";
import CoachServices from "../services/coachServices.js";
import Utils from "../config/utils.js";

const search = ref("");
const selectedSport = ref("All Sports");
const sports = ["All Sports"];
const coaches = ref([]);
const loading = ref(true);


const fetchCoaches = async () => {
  try {
    const res = await CoachServices.getAll(); 
    coaches.value = res.data.map((a) => ({
      id: a.coachID,
      name: a.user?.name || "Unknown",
      email: a.user?.email || "",
      sport: a.sport || "N/A",
      age: a.age || "-",
      weight: a.weight || "-",
      height: a.height || "-",
      isAdmin: a.user?.isAdmin || false,
    }));
    console.log("Loaded coaches:", coaches.value);
  } catch (error) {
    console.error("Error fetching coaches:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCoaches);

// Dialog states
const deleteDialog = ref(false);
const coachToDelete = ref(null);

const editDialog = ref(false);
const coachToEdit = ref(null);
const editedCoach = ref({});

const viewDialog = ref(false);
const coachToView = ref(null);


const viewCoach = (coach) => {
  coachToView.value = coach;
  viewDialog.value = true;
};


const confirmDelete = (coach) => {
  coachToDelete.value = coach;
  deleteDialog.value = true;
};


const performDelete = async () => {
  try {
    await CoachServices.delete(coachToDelete.value.id);
    coaches.value = coaches.value.filter(c => c.id !== coachToDelete.value.id);
    console.log("Coach deleted:", coachToDelete.value.id);
  } catch (error) {
    console.error("Delete failed:", error);
  }
  deleteDialog.value = false;
};


const confirmEdit = (coach) => {
  coachToEdit.value = coach;
  editedCoach.value = { ...coach };
  editDialog.value = true;
};


const saveEdit = async () => {
  try {

    await CoachServices.update(editedCoach.value.id, {
      sport: editedCoach.value.sport,
      age: editedCoach.value.age,
      weight: editedCoach.value.weight,
      height: editedCoach.value.height,
    });

   
    await CoachServices.update(editedCoach.value.id, {
      isAdmin: editedCoach.value.isAdmin,
    });


    const index = coaches.value.findIndex(c => c.id === editedCoach.value.id);
    if (index !== -1) {
      coaches.value[index] = { ...editedCoach.value };
    }

    console.log("Coach and admin status updated");
  } catch (error) {
    console.error("Edit failed:", error);
  }
  editDialog.value = false;
};
</script>

<template>
  <v-container class="coaches-container" fluid>
    <v-row justify="center" class="mt-10">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <v-select
            v-model="selectedSport"
            :items="sports"
            label="Sports"
            density="compact"
            variant="outlined"
            class="w-25 small-input"
          ></v-select>

          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search Coach"
            density="compact"
            variant="outlined"
            hide-details
            class="w-50 small-input"
          ></v-text-field>
        </div>

        <v-table class="coach-table" density="comfortable">
          <thead>
            <tr>
              <th class="text-left">Coach Name</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="coach in coaches.filter((a) =>
                a.name.toLowerCase().includes(search.toLowerCase())
              )"
              :key="coach.name"
            >
              <td>{{ coach.name }}</td>
              <td class="text-right">
                <v-btn
                  icon="mdi-account-details-outline"
                  size="small"
                  color="black"
                  variant="text"
                  @click="viewCoach(coach)"
                ></v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="black"
                  variant="text"
                  @click="confirmEdit(coach)"
                ></v-btn>
                <v-btn
                icon="mdi-delete"
                size="small"
                color="black"
                variant="text"
                @click="confirmDelete(coach)"
                ></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6 font-weight-bold">Delete</v-card-title>
                <v-card-text>
                <p>Are you sure you want to delete this coach?</p>
                <p><strong>Coach Name:</strong> {{ coachToDelete?.name }}</p>
                <p><strong>Sport:</strong> {{ coachToDelete?.sport }} </p>
                </v-card-text>

                <v-card-actions class="justify-end">
                <v-btn color="grey" variant="outlined" @click="deleteDialog = false">
                    Cancel
                </v-btn>
                <v-btn color="red" variant="elevated" @click="performDelete">
                    Delete
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="editDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6 font-weight-bold">Edit — {{ coachToEdit?.name }}</v-card-title>
                <v-card-text>
                <v-text-field v-model="editedCoach.sport" label="Sport" density="compact"></v-text-field>
                <v-text-field v-model="editedCoach.age" label="Age" type="number" density="compact"></v-text-field>
                <v-text-field v-model="editedCoach.weight" label="Weight" type="number" density="compact"></v-text-field>
                <v-text-field v-model="editedCoach.height" label="Height" type="number" density="compact"></v-text-field>
                <v-switch v-model="editedCoach.isAdmin" label="Is Admin?" color="green" hide-details></v-switch>
                </v-card-text>

                <v-card-actions class="justify-end">
                <v-btn color="grey" variant="outlined" @click="editDialog = false">
                    Cancel
                </v-btn>
                <v-btn color="green" variant="elevated" @click="saveEdit">
                    Save
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="viewDialog" max-width="450">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              Coach Details
            </v-card-title>

            <v-card-text>
              <v-list density="compact">
                <v-list-item><strong>Name:</strong> {{ coachToView?.name }}</v-list-item>
                <v-list-item><strong>Email:</strong> {{ coachToView?.email }}</v-list-item>
                <v-list-item><strong>Sport:</strong> {{ coachToView?.sport }}</v-list-item>
                <v-list-item><strong>Age:</strong> {{ coachToView?.age }}</v-list-item>
                <v-list-item><strong>Weight:</strong> {{ coachToView?.weight }} kg</v-list-item>
                <v-list-item><strong>Height:</strong> {{ coachToView?.height }} cm</v-list-item>
                <v-list-item>
                    <strong>Admin Status:</strong>
                    <v-chip
                      :color="coachToView?.isAdmin ? 'green' : 'grey'"
                      label
                      class="ml-2"
                    >
                      {{ coachToView?.isAdmin ? 'Admin' : 'Coach' }}
                    </v-chip>
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
.coaches-container {
  padding-top: 50px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding-left: 2;
  padding-right: 2;
}

.coach-table {
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
