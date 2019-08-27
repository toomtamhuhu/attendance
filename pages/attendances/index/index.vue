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
        <template slot="work_rule" slot-scope="{ data }" v-if="data.work_rule">
          <v-chip label :color="data.work_rule.color">{{ data.work_rule.short_name }}</v-chip>
        </template>
        <span slot="time_in" slot-scope="{ data }">{{ data.work_in_updated_at ? $moment(data.work_in_updated_at).format('HH:mm') : 'ยังไม่ลงเวลา' }}</span>
        <span slot="time_out" slot-scope="{ data }">{{ data.work_out_updated_at ? $moment(data.work_out_updated_at).format('HH:mm') : 'ยังไม่ลงเวลา' }}</span>
        <span slot="in_out" slot-scope="{ data }" v-if="data.work_rule">{{ `0000-01-01 ${data.work_rule.work_start}` | moment('HH:mm') }} / {{ `0000-01-01 ${data.work_rule.work_end}` | moment('HH:mm') }}</span>
        <v-chip slot="late" slot-scope="{ data }" label :color="data.late === 0 ? 'success' : 'warning'" v-if="data.late !== null">{{ data.late | numeral }}</v-chip>
        <v-chip slot="wage" slot-scope="{ data }" label :color="data.wage === 0 ? 'error' : 'info'" v-if="data.late !== null">{{ data.wage | numeral }}</v-chip>
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
          {text: 'ชื่อ', value: 'employee', callback: data => `${data.employee.name} (${data.employee.nickname})`},
          {text: 'วันที่', value: 'leave_date', callback: data => this.$moment(data.leave_date).locale('th').format('DD/MM/YY') },
          {text: 'กะ', value: 'work_rule', slot: true},
          {text: 'เวลา เข้า/ออก', value: 'in_out', slot: true},
          {text: 'ลงเข้า', value: 'time_in', slot: true},
          {text: 'ลงออก', value: 'time_out', slot: true},
          {text: 'สาย (นาที)', value: 'late', slot: true},
          {text: 'เบี้ยเลี้ยง', value: 'wage', slot: true}
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

  beforeDestroy () {
    this.removeIpcRenderer()
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
        const leaves = _.orderBy(res, ['leave_date'], ['desc'])
        this.leaves = _.reduce(leaves, (pre, cur) => {
          let start = this.filter.state.value === 'work_in_state' ? this.$moment(cur.work_in_updated_at) : this.$moment(cur.work_out_updated_at)
          let end = this.filter.state.value === 'work_in_state' ? this.$moment(_.head(leaves).work_in_updated_at) : this.$moment(_.head(leaves).work_out_updated_at)
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
        const res = await this.$axios.$post('/v2/api/leaves/finger-print', {
          branch_id: this.filter.branch.id,
          employee_id: this.employee_id,
          leave_date: this.$moment().format('YYYY-MM-DD'),
          state: this.filter.state.value
        })
        console.log(res)
        this.noticeAlert(res)
        this.fetchData()
      } catch (e) {
        this.errorAlert(e)
      }
    }, 200),
    listenIpcRenderer () {
      ipcRenderer.on('getFingerPrintDetail', (event, arg) => {
        if (arg.employee_id) {
          this.employee_id = arg.employee_id
          this.submit()
        }
      })
    },
    removeIpcRenderer () {
      ipcRenderer.removeAllListeners('getFingerPrintDetail')
    }
  }
}
</script>