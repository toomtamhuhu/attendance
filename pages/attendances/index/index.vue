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
              v-model="filter.state"
              :items="states"
              item-text="name"
              :return-object="true"
          />
        </v-flex>
        <v-flex />
      </v-layout>
      <v-divider class="my-3"/>
      <v-table :table="tableData">
        <template slot="work_rule" slot-scope="{ data }">
          <v-chip label>{{ data.work_rule.short_name }}</v-chip>
        </template>
        <span slot="work_start" slot-scope="{ data }">{{ `0000-01-01 ${data.work_rule.work_start}` | moment('HH:mm') }} - {{ `0000-01-01 ${data.work_rule.work_end}` | moment('HH:mm') }}</span>
      </v-table>
    </div>
  </v-page>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapGetters } from 'vuex'
import BranchSelector from '@/components/layouts/BranchSelector'

export default {
  components: {
    BranchSelector
  },

  data() {
    return {
      filter: {
        branch: null,
        state: null
      },
      employee_id: null,
      loading: false,
      states: [{ value: 'work_in_state', name: 'เข้า'}, { value: 'work_out_state', name: 'ออก'}],
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
          {text: 'วันที่', value: 'leave_date', callback: data => this.$moment(data.updated_at).locale('th').format('DD/MM/YY HH:mm') },
          {text: 'กะ', value: 'work_rule', slot: true},
          {text: 'เวลา เข้า-ออก งาน', value: 'work_start', slot: true},
          {text: 'สาย (นาที)', value: 'late', callback: data => this.$numeral(data.late).format('0,0') },
          {text: 'เบี้ยเลี้ยง', value: 'wage', callback: data => this.$numeral(data.wage).format('0,0') }
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
    'filter.state' (data) {
      if (data) this.fetchData()
    }
  },

  created () {
    this.listenIpcRenderer()
    this.filter.state = this.states[0]
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
            state: this.filter.state.value,
            withEmployee: true,
            workRule: true
          }
        })
        console.log(res)
        this.leaves = _.reduce(res, (pre, cur) => {
          let start = this.$moment(cur.updated_at)
          let end = this.$moment(_.last(res).updated_at)
          let duration = this.$moment.duration(end.diff(start))
          if (duration.asHours() <= 24) pre.push(cur)
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
          state: this.filter.state.value
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