<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent width="750">
      <v-card>
        <v-card-title class="headline">บันทึกลายนิ้วมือของ {{ data ? data.nickname : '' }} (นิ้วที่ {{ number }})</v-card-title>
        <v-container grid-list-md text-xs-center>
          <v-layout row wrap>
            <v-flex xs6>
              <v-form>
                <v-text-field
                    background-color="yellow lighten-2"
                    value="จำนวนนิ้วคงเหลือ"
                    label="Solo"
                    solo
                    readonly
                />
              </v-form>
            </v-flex>
            <v-flex xs6>
              <v-form>
                <v-text-field
                    :value="enroll_idx"
                    label="Solo"
                    solo
                    readonly
                />
              </v-form>
            </v-flex>
          </v-layout>
          <v-progress-linear color="success" :value="countEnroll()" />
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn outline  color="error" flat @click="closeDialog">ยกเลิก</v-btn>
            <v-btn outline  color="success" flat @click="save">ยืนยัน</v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { ipcRenderer } from 'electron'
import axios from 'axios'

export default {
  props: {
    open: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    number: {
      type: Number,
      default: 1
    }
  },

  data() {
    return {
      dialog: false,
      submitting: false,
      enroll_idx: 3,
      form: {
        finger_print1: null,
        finger_print2: null
      }
    }
  },

  watch: {
    open (data) {
      if (data) {
        ipcRenderer.send('openFingerRegister', {
          ...this.data,
          finger: this.number
        })

        ipcRenderer.on('getFingerPrintDetail', (event, arg) => {
          if (arg.process === 'register') {
            this.enroll_idx = arg.enroll_idx
            if (arg.status === false) {
              this.noticeAlert(arg)
              ipcRenderer.send('closeFingerRegister')
              this.close()
            }
            if (arg.enroll_idx === 0) {
              this.noticeAlert(arg)
              this.form.finger_print1 = this.number === 1 ? this.data.finger_print1 !== null ? this.data.finger_print1 : arg.base64 : this.data.finger_print1
              this.form.finger_print2 = this.number === 2 ? this.data.finger_print2 !== null ? this.data.finger_print2 : arg.base64 : this.data.finger_print2
              this.save()
            }
          }
        })

        ipcRenderer.on('fingerCaptureStatus', (event, arg) => {
          console.log(arg)
        })

        this.dialog = true
      } else {
        ipcRenderer.send('closeFingerRegister')
        ipcRenderer.removeAllListeners('getFingerPrintDetail')
        ipcRenderer.removeAllListeners('fingerCaptureStatus')
      }
    }
  },

  computed: {

  },

  methods: {
    countEnroll () {
      return (3 - this.enroll_idx) * 33.33
    },
    resetForm () {
      this.dialog = false
      this.enroll_idx = 3
      this.form = {
        number: 1,
        finger_print1: null,
        finger_print2: null
      }
    },
    async closeDialog () {
      this.resetForm()
      this.$emit('closed')
    },
    async save () {
      this.submitting = true
      try {
        const res = await this.$axios.$post(`/v2/api/employees/${this.data.id}/add-finger-print`, this.form)

        const finger_print = ipcRenderer.sendSync('addFingerTemplate', {
          id: res.saved.id,
          finger: this.number,
          template: this.number === 1 ? this.form.finger_print1 : this.form.finger_print2
        })

        if (!finger_print.status) return this.errorAlert('ไม่สำเร็จ!')
        this.$emit('onSubmitted', res.saved)
      } catch (e) {
        this.errorAlert(e)
      } finally {
        this.submitting = false
        this.closeDialog()
      }
    }
  }
}
</script>