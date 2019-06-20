<template>
  <div>
    <v-layout justify-end>
      <v-btn
          class="mx-0"
          color="primary"
          :outline="outline"
          dark
          @click.stop="dialog = true"
      >
        {{ buttonText }}
      </v-btn>
    </v-layout>
    <v-divider class="my-3"></v-divider>

    <v-dialog
        v-model="dialog"
        width="500"
    >
      <v-card>
        <v-card-title class="headline">Use Google's location service?</v-card-title>

        <v-card-text>
          Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
              color="green darken-1"
              flat="flat"
              @click="dialog = false"
          >
            Disagree
          </v-btn>

          <v-btn
              color="green darken-1"
              flat="flat"
              @click="dialog = false"
          >
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    outline: {
      type: Boolean,
      default: true
    },
    buttonText: {
      type: String,
      default: 'เพิ่ม'
    }
  },
  data() {
    return {
      dialog: false
    }
  }
}
</script>