<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent width="750">
      <v-card>
        <v-card-title class="headline">บันทึกลายนิ้วมือของ {{ data ? data.nickname : '' }}</v-card-title>
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
    }
  },

  data() {
    return {
      dialog: false,
      submitting: false,
      enroll_idx: 3,
      form: {
        number: 1,
        finger_print: null
      }
    }
  },

  watch: {
    open (data) {
      if (data) {
        ipcRenderer.send('openFingerRegister', {
          ...this.data,
          finger: this.form.number
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
              this.form.finger_print = arg.base64
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
      this.enroll_idx = 3
      this.form = {
        number: 1,
        finger_print: null
      }
    },
    async closeDialog () {
      this.dialog = false
      this.$emit('closed')
    },
    async save () {
      this.submitting = true
      try {
        const res = await axios({
          method: 'POST',
          url: 'http://vue-hrm.huhu/graphql',
          data: {
            query: `mutation ($id: ID!, $finger_print: String!) {
              updateEmployeeFingerPrint(id: $id, finger_print: $finger_print) {
                  id
                  name
                  nickname
                  finger_print
                  branch_id
                  branch {
                    name
                  }
                }
              }`,
            variables: {
              id: this.data.id,
              finger_print: this.form.finger_print
            }
          }
        })
        ipcRenderer.sendSync('addFingerTemplate', {
          id: this.data.id,
          finger: this.form.number,
          template: this.form.finger_print
        })
        if(res.status === 200) this.$emit('onSubmitted', res.data.data.updateEmployeeFingerPrint)

      } catch (e) {
        this.errorAlert(e)
      } finally {
        this.dialog = false
        this.submitting = false
      }
    }
  }
}
</script>