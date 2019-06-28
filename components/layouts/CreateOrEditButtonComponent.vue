<template>
  <div>
    <v-layout justify-end>
      <v-dialog
          persistent
          v-model="dialog"
          :width="width"
      >
        <template v-slot:activator="{ on }">
          <v-btn
              :color="color"
              :outline="outline"
              dark
              v-on="on"
          >
            {{ text }}
          </v-btn>
        </template>
        <v-card>
          <v-layout justify-end>
            <v-flex xs12 sm1>
              <v-btn flat icon color="red" @click="closeDialog">
                <v-icon>close</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
          <slot name="header"/>

          <slot name="content"/>

          <slot name="footer">
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="success"
                  @click="save"
              >
                บันทึก
              </v-btn>
            </v-card-actions>
          </slot>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary'
    },
    outline: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: 'เพิ่ม'
    },
    width: {
      type: String,
      default: '750'
    }
  },
  data() {
    return {
      dialog: false
    }
  },
  watch: {
    open (data) {
      if (data) this.dialog = true
    }
  },
  methods: {
    async closeDialog () {
      this.dialog = false
      this.$emit('closed')
    },
    async save () {
      this.dialog = false
      this.$emit('submitted')
    }
  }
}
</script>