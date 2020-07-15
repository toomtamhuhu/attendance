<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent width="750">
      <v-card v-if="item.data">
        <v-layout justify-end>
          <v-flex xs12 sm1>
            <v-btn flat icon color="red" @click="closeDialog(false)">
              <v-icon>close</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex xs6>
              เวลาสแกนในระบบ
            </v-flex>
            <v-flex xs6>
              เวลาสแกนจริง
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs6>
              <v-layout row wrap v-for="work_rule in item.data.work_rule.times" :key="work_rule.id">
                <v-flex>
                  {{ work_rule.time }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs6>
              <v-layout row wrap v-for="time in item.data.times" :key="time.id">
                <v-flex>
                  {{ time.time | moment('HH:mm') }}
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  components: {
  },

  props: {
    item: {
      type: Object,
      default() {
        return null
      }
    }
  },

  data() {
    return {
      dialog: false
    }
  },

  watch: {
    item(data) {
      this.dialog = data.open
    }
  },

  methods: {
    async closeDialog (state) {
      this.dialog = false
      this.$emit('closed', state)
    }
  }
}
</script>
