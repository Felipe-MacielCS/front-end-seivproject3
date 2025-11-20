<template>
  <v-container class="pa-6">
    <v-row justify="center">
      <v-col cols="12" md="8">

        <!-- Main Profile Card -->
        <v-card elevation="4" class="pa-6">

          <v-row>
            <!-- Avatar -->
            <v-col cols="12" md="4" class="d-flex justify-center align-center">
              <v-avatar size="150" class="mb-4">
                <v-icon size="120">mdi-account-circle</v-icon>
              </v-avatar>
            </v-col>

            <!-- Name + Edit Button -->
            <v-col cols="12" md="8" class="d-flex flex-column justify-center">
              <h1 class="font-weight-bold text-h4">{{ athlete.name }}</h1>

              <v-btn color="primary" class="mt-4" @click="openEdit">
                Edit Profile
              </v-btn>
            </v-col>
          </v-row>

          <!-- Athlete Stats Box -->
          <v-card class="pa-4 mt-4" color="#b8ced8">
            <p><strong>Weight:</strong> {{ athlete.weight }} lb</p>
            <p><strong>Height:</strong> {{ athlete.height }}</p>
            <p><strong>Age:</strong> {{ athlete.age }}</p>
            <p><strong>Sport:</strong> {{ athlete.sport }}</p>
          </v-card>

        </v-card>
      </v-col>
    </v-row>

    <!-- EDIT PROFILE DIALOG -->
    <v-dialog v-model="editDialog" max-width="600px">
      <v-card class="pa-6">

        <h2 class="mb-4">Edit Profile</h2>

        <v-form ref="form" v-model="isValid">
          <v-text-field
            v-model="editForm.name"
            label="Name"
            :rules="[rules.required, rules.min2]"
          ></v-text-field>

          <v-text-field
            v-model="editForm.weight"
            label="Weight (lb)"
            :rules="[rules.required, rules.number]"
          ></v-text-field>

          <v-text-field
            v-model="editForm.height"
            label="Height"
            :rules="[rules.required]"
          ></v-text-field>

          <v-text-field
            v-model="editForm.age"
            label="Age"
            :rules="[rules.required, rules.number]"
          ></v-text-field>

          <v-text-field
            v-model="editForm.sport"
            label="Sport"
            :rules="[rules.required]"
          ></v-text-field>
        </v-form>

        <v-card-actions class="mt-4">
          <v-spacer></v-spacer>

          <v-btn color="grey" @click="editDialog = false">Cancel</v-btn>

          <v-btn color="primary" @click="saveEdit">Save Changes</v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import athleteServices from "../services/athleteServices";

const athlete = ref({
  name: "",
  weight: "",
  height: "",
  age: "",
  sport: ""
});

// Dialog + form state
const editDialog = ref(false);
const editForm = ref({});
const form = ref(null);
const isValid = ref(false);

const storedUser = JSON.parse(localStorage.getItem("user"));
const athleteID = storedUser?.athleteID;

// Validation rules
const rules = {
  required: (v) => !!v || "This field is required.",
  number: (v) => (!isNaN(Number(v)) && v !== "") || "Must be a number.",
  min2: (v) => (v && v.length >= 2) || "Must be at least 2 characters."
};

// Load athlete on mount
onMounted(async () => {
  if (athleteID) {
    const res = await athleteServices.get(athleteID);
    athlete.value = res.data;
  }
});

// Open edit form
function openEdit() {
  editForm.value = { ...athlete.value };
  editDialog.value = true;
}

// Save profile changes
async function saveEdit() {
  // Validate before submit
  const valid = await form.value.validate();
  if (!valid) return;

  try {
    await athleteServices.update(athleteID, editForm.value);

    // Reload updated data
    const res = await athleteServices.get(athleteID);
    athlete.value = res.data;

    editDialog.value = false;
  } catch (err) {
    console.error(err);
  }
}
</script>

<style scoped>
h1 {
  font-size: 32px;
}
p {
  font-size: 18px;
}
</style>
