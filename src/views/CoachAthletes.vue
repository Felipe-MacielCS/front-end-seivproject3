<script setup>
import { ref, onMounted } from "vue";
import AthleteServices from "../services/athleteServices.js";
import UserServices from "../services/userServices.js";

const search = ref("");
const selectedSport = ref("All Sports");
const sports = ["All Sports"];
const athletes = ref([]);
const loading = ref(true);

const fetchAthletes = async () => {
  try {
    const res = await AthleteServices.getAll();
    athletes.value = res.map((a) => ({
      id: a.athleteID,
      name: a.user?.name || "Unknown",
      email: a.user?.email || "",
      sport: a.sport || "N/A",
      age: a.age || "-",
      weight: a.weight || "-",
      height: a.height || "-",
      isCoach: a.user?.isCoach || false,
    }));
    console.log("Loaded athletes:", athletes.value);
  } catch (error) {
    console.error("Error fetching athletes:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAthletes);

const viewDialog = ref(false);
const athleteToView = ref(null);

const viewAthlete = (athlete) => {
  athleteToView.value = athlete;
  viewDialog.value = true;
};

</script>

<template>
  <v-container class="athletes-container" fluid>
    <v-row justify="center" class="mt-10">
      <v-col cols="12">
        
        <div class="d-flex align-center justify-space-between mb-4">

                
             <div class="d-flex align-center gap-4" style="width: 70%;">
                <v-select
                v-model="selectedSport"
                :items="sports"
                label="Sports"
                density="compact"
                variant="outlined"
                class="w-25 small-input"
                />

                <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search Athlete"
                density="compact"
                variant="outlined"
                hide-details
                class="flex-grow-1 small-input"
                 />
            </div>

            <div>
                <v-btn
                color="black"
                class="add-athlete-btn"
                prepend-icon="mdi-plus"
                rounded="lg"
                size="large"
                >
                ADD ATHLETE
                </v-btn>
            </div>

            </div>


        <v-table class="athlete-table" density="comfortable">
          <thead>
            <tr>
                <th class="text-left">Athlete Name</th>
                <th class="text-left">Age</th>
                <th class="text-left">Height</th>
                <th class="text-left">Weight</th>
                <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="athlete in athletes.filter((a) =>
                a.name.toLowerCase().includes(search.toLowerCase())
              )"
              :key="athlete.name"
              class="table-row"
            >
              <td>{{ athlete.name }}</td>
                <td>{{ athlete.age }}</td>
                <td>{{ athlete.height }}</td>
                <td>{{ athlete.weight }}</td>

              <td class="text-right">
                <v-btn
                  icon="mdi-account-details-outline"
                  size="small"
                  color="black"
                  variant="text"
                  @click="viewAthlete(athlete)"
                ></v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-dialog v-model="viewDialog" max-width="450">
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              Athlete Details
            </v-card-title>

            <v-card-text>
              <v-list density="compact">
                <v-list-item><strong>Name:</strong> {{ athleteToView?.name }}</v-list-item>
                <v-list-item><strong>Email:</strong> {{ athleteToView?.email }}</v-list-item>
                <v-list-item><strong>Sport:</strong> {{ athleteToView?.sport }}</v-list-item>
                <v-list-item><strong>Age:</strong> {{ athleteToView?.age }}</v-list-item>
                <v-list-item><strong>Weight:</strong> {{ athleteToView?.weight }} kg</v-list-item>
                <v-list-item><strong>Height:</strong> {{ athleteToView?.height }} cm</v-list-item>
                <v-list-item>
                    <strong>Coach Status:</strong>
                    <v-chip
                      :color="athleteToView?.isCoach ? 'green' : 'grey'"
                      label
                      class="ml-2"
                    >
                      {{ athleteToView?.isCoach ? 'Coach' : 'Athlete' }}
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
.athletes-container {
  padding-top: 50px;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding-left: 2;
  padding-right: 2;
}

.athlete-table {
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
td.text-right {
  padding-right: 18px;
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
.add-athlete-btn {
  color: white !important;
  font-weight: 700;
  padding: 10px 22px;
  letter-spacing: 0.5px;
  box-shadow: 0px 3px 6px rgba(0,0,0,0.25);
}

.gap-4 {
  gap: 16px;
}
</style>
