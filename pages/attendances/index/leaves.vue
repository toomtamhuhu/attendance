<template>
  <v-page>
    <div slot="content">
      <v-layout row wrap>
        <v-flex xs4>
          <BranchSelector :disabled="!userCan('branch_selectable')" @input="data => filter.branch = data" />
        </v-flex>
        <v-spacer />
        <v-flex xs4>
          <v-dialog
              ref="dialog"
              v-model="modal"
              :return-value.sync="filter.month"
              lazy
              full-width
              width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                  v-model="filter.month"
                  label="เดือน"
                  prepend-icon="event"
                  readonly
                  v-on="on"
              />
            </template>
            <v-date-picker v-model="filter.month" locale="th" type="month" @input="$refs.dialog.save(filter.month)" scrollable />
          </v-dialog>
        </v-flex>
        <v-flex />
      </v-layout>
      <LeaveTable v-if="!loading" :data="employees" :month="filter.month" @onCellClick="handleLeaveTableClick" />
      <LeaveModal :data="selectedDate" @closed="closedLeaveModal" />
    </div>
  </v-page>
</template>

<script>
import axios from 'axios'
import BranchSelector from '@/components/layouts/BranchSelector'
import LeaveTable from '@/components/attendances/LeaveTable'
import LeaveModal from '@/components/attendances/LeaveModal'

export default {
  components: {
    BranchSelector,
    LeaveTable,
    LeaveModal
  },

  data () {
    return {
      menu: false,
      modal: false,
      employees: [],
      filter: {
        branch: null,
        month: new Date().toISOString().substr(0, 7)
      },
      loading: false,
      selectedDate: {
        open: false,
        branch_id: null,
        day: null,
        employee: null
      }
    }
  },

  watch: {
    'filter.branch' (data) {
      if (data) this.fetchData()
    },
    'filter.month' (data) {
      if (data) this.fetchData()
    }
  },

  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await axios({
          method: "GET",
          url: "http://vue-hrm.huhu/graphql",
          data: {
            query: `query ($from: String, $to: String) {
            employeeLeaveDateRangeQuery(branch_id: ${this.filter.branch.id}, from: $from, to: $to) {
                id
                nickname
                name
                gender
                leaves {
                  id
                  employee_id
                  type
                  work_rule_id
                  leave_date
                  description
                  certificate
                }
              }
            }`,
            variables: {
              from: this.$moment(this.filter.month).startOf('month').format('YYYY-MM-DD'),
              to: this.$moment(this.filter.month).endOf('month').format('YYYY-MM-DD')
            }
          }
        })
        this.employees = res.data.data.employeeLeaveDateRangeQuery
      } catch (e) {
        this.errorAlert(e)
      }
      this.loading = false
    },
    handleLeaveTableClick (data) {
      this.selectedDate = {
        open: true,
        branch_id: this.filter.branch.id,
        day: data[0],
        employee: data[1]
      }
    },
    closedLeaveModal (state) {
      this.selectedDate = {
        open: false,
        branch_id: null,
        day: null,
        employee: null
      }
      if (state) this.fetchData()
    }
  }
}
</script>