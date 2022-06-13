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
        <v-flex>
          <v-btn outline color="success" @click="print('leave')" :loading="loading">ปริ้นกะงาน</v-btn>
        </v-flex>
        <v-flex>
          <v-btn outline color="info" @click="print('attendance')" :loading="loading">ปริ้นลงเวลา</v-btn>
        </v-flex>
      </v-layout>
      <LeaveTable v-if="!loading" :data="employees" :month="filter.month" @onCellClick="handleLeaveTableClick" />
      <LeaveModal :data="selectedDate" @closed="closedLeaveModal" />
    </div>
    <div slot="footer">
      <v-layout wrap v-for="(work_rules, index) in WorkRuleSlice" :key="index">
        <v-flex v-for="(work_rule, i) in work_rules" :key="i" xs4>
          <v-chip label :color="work_rule.color">{{ work_rule.short_name }}</v-chip> ({{ `0000-01-01 ${work_rule.work_start}` | moment('HH:mm') }} - {{ `0000-01-01 ${work_rule.work_end}` | moment('HH:mm') }})
        </v-flex>
      </v-layout>
    </div>
  </v-page>
</template>

<script>
import { mapGetters } from 'vuex'
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

  computed: {
  ...mapGetters({
      work_rules: 'WorkRules/data'
    }),
    WorkRuleSlice() {
      return _.chunk(this.work_rules, 3)
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
        const res = await this.$axios.$get('/v2/api/employees/leave-date-range', {
					'params': {
						branch_id: this.filter.branch.id,
						from: this.$moment(this.filter.month).startOf('month').format('YYYY-MM-DD'),
						to: this.$moment(this.filter.month).endOf('month').format('YYYY-MM-DD')
					}
				})
        
        this.employees = res
      } catch (e) {
        console.log(e)
        // this.errorAlert(e)
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
    },
    async print (reportType) {
      try {
        this.loading = true
        const res = await this.$axios.$get(`/v2/api/leaves/attendance-report`, {
          'params' : {
            branch_id: this.filter.branch.id,
            from: this.$moment(this.filter.month).startOf('month').format('YYYY-MM-DD'),
            to: this.$moment(this.filter.month).endOf('month').format('YYYY-MM-DD'),
            report_type: reportType
          }
        })

        await this.$printReport({
          report_type: reportType,
          url: res,
          preview: true
        })
      } catch (e) {
        this.errorAlert(e)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>