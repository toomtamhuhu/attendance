<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent width="750">
      <v-card v-if="data.employee">
        <v-layout justify-end>
          <v-flex xs12 sm1>
            <v-btn flat icon color="red" @click="closeDialog(false)">
              <v-icon>close</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-card-title class="headline">{{ data.day | moment('D MMMM YYYY') }} - ({{ data.employee.name }} {{ data.employee.nickname }})</v-card-title>
        <v-container grid-list-md text-xs-center>
          <v-layout row wrap>
            <v-flex xs4>
              ลากิจ: {{ availableLeaves.availableLeaves }} / {{ availableLeaves.leavesLimits }} ลาป่วย: {{ availableLeaves.availableSickLeaves }} / {{ availableLeaves.sickLeaveLimits }}
            </v-flex>
          </v-layout>
          <v-card-text>
            <v-form>
              <v-layout row wrap>
                <v-flex xs4>
                  <v-select
                      v-model="form.type"
                      :items="types"
                      item-text="name"
                      :return-object="true"
                  />
                </v-flex>
                <v-spacer></v-spacer>
                <v-flex xs4 v-if="form.type.value === -1">
                  <WorkRuleSelector :value="form.work_rule_id" @input="data => selectedWorkRule = data"/>
                </v-flex>
                <v-flex/>
              </v-layout>
              <v-text-field
                  v-focus-next
                  v-model="form.description"
                  label="หมายเหตุ"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn outline  color="error" flat @click="deleteLeave()" v-if="form.id">ลบ</v-btn>
            <v-btn outline  color="success" flat @click="save">ยืนยัน</v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import axios from 'axios'
import WorkRuleSelector from '@/components/attendances/WorkRuleSelector'

export default {
  components: {
    WorkRuleSelector,
  },

  props: {
    data: {
      type: Object,
      default() {
        return null
      }
    }
  },

  data() {
    return {
      loading: false,
      dialog: false,
      form: {
        employee_id: null,
        work_rule_id: null,
        leave_date: this.$moment().format('YYYY-MM-DD'),
        description: null
      },
      types: [{ value: -1, name: 'กะงาน'}, { value: 0, name: 'หยุด'}],
      selectedWorkRule: null,
      availableLeaves: {availableLeaves: 0, availableSickLeaves: 0, leavesLimits: 0, sickLeaveLimits: 0},
      mismatches: []
    }
  },

  watch: {
    data(data) {
      if (data.open) {
        this.dialog = true
        this.getAvailableLeaves()
        let leave = _.find(data.employee.leaves, {'leave_date': this.$moment(data.day).format('YYYY-MM-DD')})
        this.form = typeof leave === 'undefined' ? {
          employee_id: data.employee.id,
          leave_date: this.$moment(data.day).format('YYYY-MM-DD'),
          type: this.types[0],
          description: null,
          work_rule_id: null
        } : leave
        if(typeof this.form.type === 'number' && this.form.type !== -2) this.form.type = _.find(this.types, {'value': this.form.type})
      } else {
        const index = _.findIndex(this.types, { 'value': 3 } )
        if (index > -1) this.types.splice(index, 1)
        this.dialog = false
      }
    }
  },

  methods: {
    async closeDialog (state) {
      this.availableLeaves = {availableLeaves: 0, availableSickLeaves: 0, leavesLimits: 0, sickLeaveLimits: 0}
      this.dialog = false
      this.$emit('closed', state)
    },
    async getAvailableLeaves() {
      this.loading = true
      try {
        const res = await this.$axios.$get(`v2/api/leaves/available/${this.data.employee.id}`)
        this.availableLeaves = {
          availableLeaves: res.available_leaves,
          availableSickLeaves: res.available_sick_leaves,
          leavesLimits: res.leaves_limits,
          sickLeaveLimits: res.sick_leave_limits
        }
      } catch (e) {
        this.availableLeaves = {availableLeaves: 0, availableSickLeaves: 0, leavesLimits: 0, sickLeaveLimits: 0}
      }
      this.loading = false
    },
    async save() {
      if (!this.checkMonth()) return
      this.loading = true
      try {
        this.form.work_rule_id = this.form.type.value === -1 ? this.selectedWorkRule.id : null
        this.form.type = this.form.type.value
        if (this.form.id) {
          const res = await this.$axios.$put(`/v2/api/leaves/${this.form.id}`, {
            id: this.form.id,
            type: this.form.type,
            work_rule_id: this.form.work_rule_id,
            description: this.form.description
          })
          this.$emit('closed', res.status)
        } else {
          const res = await axios({
            method: 'POST',
            url: process.env.graphqlUrl || 'http://hr.tsgoldprices.tk/graphql',
            data: {
              query: `mutation ($employee_id: Int!, $type: Int!, $work_rule_id: Int, $leave_date: String!, $description: String, $work_in_state: Int) {
              createLeave(employee_id: $employee_id, type: $type, work_rule_id: $work_rule_id, leave_date: $leave_date, description: $description, work_in_state: $work_in_state) {
                  employee_id
                  type
                  work_rule_id
                  leave_date
                  description
                  work_in_state
                }
              }`,
              variables: {
                employee_id: this.form.employee_id,
                type: this.form.type,
                work_rule_id: this.form.work_rule_id,
                leave_date: this.form.leave_date,
                description: this.form.description,
                work_in_state: 0
              }
            }
          })
          this.$emit('closed', res.status === 200 ? true : false)
        }
      } catch (e) {
        this.errorAlert(e)
      } finally {
        this.loading = false
      }
    },
    async deleteLeave() {
      if (!this.checkMonth()) return
      if (!confirm('ลบ?')) return
      this.loading = true
      try {
        const res = await axios({
          method: 'POST',
          url: process.env.graphqlUrl || 'http://hr.tsgoldprices.tk/graphql',
          data: {
            query: `mutation ($id: Int!) {
              deleteLeave(id: $id) {
                  employee_id
                  type
                  work_rule_id
                  leave_date
                  description

                }
              }`,
            variables: {
              id: this.form.id
            }
          }
        })
        this.$emit('closed', res.status === 200 ? true : false)
      } catch (e) {
        this.errorAlert(e)
      }
      this.loading = false
    },
    checkMonth() {
      let currentMonth = this.$moment(this.form.leave_date).startOf('month')
      let lastMonth = this.$moment().startOf('month')
      if (currentMonth.diff(lastMonth, 'months') < 0) {
        this.errorAlert('ไม่สามารถแก้ไขวันหยุดย้อนหลังได้')
        return false
      }
      return true
    }
  }
}
</script>
