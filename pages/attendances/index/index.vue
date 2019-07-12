<template>
  <v-page>
    <div slot="content">
      <v-layout row wrap>
        <v-flex xs4>
          <BranchSelector :value="activeBranch" :disabled="!userCan('branch_selectable')" @input="data => filter.branch = data" />
        </v-flex>
        <v-spacer />
        <v-flex xs4>
          <v-select
              v-model="selectedState"
              :items="states"
              item-text="name"
              :return-object="true"
          />
        </v-flex>
        <v-flex />
      </v-layout>
      <v-divider class="my-3"/>
      <v-table :table="tableData">
        <template slot="finger_print" slot-scope="{ data }">
          test
        </template>
      </v-table>

    </div>
  </v-page>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapGetters } from 'vuex'
import BranchSelector from '@/components/layouts/BranchSelector'
import numeral from 'numeral'
import moment from 'moment'

export default {
  components: {
    BranchSelector
  },

  data() {
    return {
      filter: {
        branch: null
      },
      employee_id: null,
      loading: false,
      selectedState: null,
      states: [{ value: 0, name: 'เข้า'}, { value: 1, name: 'ออก'}],
      leaves: []
    }
  },

  computed: {
    ...mapGetters({
      activeBranch: 'Branches/active'
    }),
    tableData() {
      const table = {
        headers: [
          {text: 'ชื่อ', value: 'employee.name'},
          {text: 'วันที่', value: 'leave_date', formatter (data) { return moment(data.leave_date).format('DD-MM-YYYY') }},
          {text: 'สาย', value: 'late', formatter (data) { return numeral(data.late).format('0,0.[00]') }},
        ],
        desserts: this.leaves
      }
      return table
    }
  },

  watch: {
    'filter.branch' (data) {
      if (data) this.fetchData()
    },
    selectedState (data) {
      if (data) this.fetchData()
    }
  },

  created () {
    this.listenIpcRenderer()
    this.selectedState = this.states[0]
  },

  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await this.$axios.$get('/v2/api/leaves', {
          'params': {
            branch_id: this.filter.branch.id,
            from: this.$moment().startOf('month').format('YYYY-MM-DD'),
            to: this.$moment().endOf('month').format('YYYY-MM-DD'),
            state: this.selectedState.value,
            withEmployee: true
          }
        })
        this.leaves = _.reduce(res, (pre, cur) => {
          let start = this.$moment(cur.updated_at)
          let end = this.$moment(_.last(res).updated_at)
          let duration = this.$moment.duration(end.diff(start))
          if (duration.asHours() <= 30) pre.push(cur)
          return pre
        }, [])
      } catch (e) {
        // this.errorAlert(e)
      }
      this.loading = false
    },
    submit: _.debounce(async function () {
      try {
        await this.$axios.$post('/v2/api/leaves/finger-print', {
          branch_id: this.filter.branch.id,
          employee_id: this.employee_id,
          leave_date: this.$moment().format('YYYY-MM-DD'),
          state: this.selectedState.value
        })
        this.fetchData()
      } catch (e) {
        this.errorAlert(e)
      }
    }, 500),
    listenIpcRenderer () {
      ipcRenderer.on('getFingerPrintDetail', (event, arg) => {
        if (arg.employee_id) {
          this.employee_id = arg.employee_id
          this.submit()
        }
      })
    },
  }
}
</script>