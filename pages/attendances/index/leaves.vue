<template>
  <v-page>
    <div slot="content">
      <v-layout row wrap>
        <v-flex xs4>
          <BranchSelector :disabled="!userCan('branch_selectable')" @input="data => filter.branch = data" />
        </v-flex>
        <v-spacer></v-spacer>
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
                  label="วันที่"
                  prepend-icon="event"
                  readonly
                  v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="filter.month" locale="th" type="month" @input="$refs.dialog.save(filter.month)" scrollable />
          </v-dialog>
        </v-flex>
        <v-flex />
      </v-layout>
      <v-layout>
        <LeaveTable v-if="!loading" :data="employees" :month="filter.month" />
      </v-layout>
    </div>
  </v-page>
</template>

<script>
import axios from 'axios'
import BranchSelector from '@/components/layouts/BranchSelector'
import LeaveTable from '@/components/attendances/LeaveTable'

export default {
  components: {
    BranchSelector,
    LeaveTable
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
      selectedDate: null
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
                leaves {
                  id
                  employee_id
                  leave_date
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
    }
  }
}
</script>