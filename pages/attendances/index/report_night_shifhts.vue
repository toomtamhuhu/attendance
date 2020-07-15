<template>
  <v-page>
    <div slot="content">
      <v-layout row wrap>
        <v-flex xs4>
          <BranchSelector :value="activeBranch" :disabled="!userCan('branch_selectable')" @input="data => filter.branch = data" />
        </v-flex>
        <v-flex xs4>
          <v-select
              v-model="filter.employee"
              :items="filteredEmployees"
              item-text="nickname"
              multiple
              :return-object="true"
          />
        </v-flex>
        <v-spacer />
        <v-flex>
          <v-btn color="info" @click="fetchData" :loading="loading">ค้นหา</v-btn>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex xs4>
          <v-dialog
              ref="form_date"
              v-model="formDateModal"
              :return-value.sync="filter.from_date"
              lazy
              full-width
              width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                  v-model="filter.from_date"
                  label="เดือน"
                  prepend-icon="event"
                  readonly
                  v-on="on"
              />
            </template>
            <v-date-picker v-model="filter.from_date" locale="th" @input="$refs.form_date.save(filter.from_date)" scrollable />
          </v-dialog>
        </v-flex>
        <v-flex xs4>
          <v-dialog
              ref="to_date"
              v-model="toDateModal"
              :return-value.sync="filter.to_date"
              lazy
              full-width
              width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                  v-model="filter.to_date"
                  label="เดือน"
                  prepend-icon="event"
                  readonly
                  v-on="on"
              />
            </template>
            <v-date-picker v-model="filter.to_date" locale="th" @input="$refs.to_date.save(filter.to_date)" scrollable />
          </v-dialog>
        </v-flex>
      </v-layout>
      <v-divider class="my-3"/>
      <v-table :table="tableData" :loading="loading">
        <template slot="work_rule" slot-scope="{ data }" v-if="data.work_rule">
          <v-chip label :color="data.work_rule.color">{{ data.work_rule.short_name }}</v-chip>
        </template>
        <v-icon slot="check" slot-scope="{ data }" :color="data.times.length === data.work_rule.times.length ? 'green' : 'red'" style="cursor: pointer;" @click="show(data)">{{ data.force_time ? 'check' : 'close' }}</v-icon>
      </v-table>
      <NigthShiftModal :item="nightShiftModal" :closed="closeNightShiftModal" />
    </div>
  </v-page>
</template>

<script>
import { mapGetters } from 'vuex'
import BranchSelector from '@/components/layouts/BranchSelector'
import NigthShiftModal from '@/components/attendances/NigthShiftModal'

export default {
  components: {
    BranchSelector,
    NigthShiftModal
  },

  data() {
    return {
      formDateModal: false,
      toDateModal: false,
      filter: {
        branch: null,
        employee: [],
        from_date: new Date().toISOString().substr(0, 10),
        to_date: new Date().toISOString().substr(0, 10)
      },
      loading: false,
      leaves: [],
      filteredEmployees: [],
      nightShiftModal: {
        open: false,
        data: null
      }
    }
  },

  computed: {
    ...mapGetters({
      activeBranch: 'Branches/active',
      employees: 'Employees/data'
    }),
    tableData() {
      const table = {
        headers: [
          {text: 'ชื่อ', value: 'full_name'},
          {
            text: 'วันที่',
            value: 'leave_date',
            callback: data => this.$moment(data.leave_date).locale('th').format('DD/MM/YY')
          },
          {text: 'กะ', value: 'work_rule', slot: true},
          {text: 'เวลา เข้า/ออก', value: 'in_out'},
          {text: 'สแกนกะดึก', value: 'check', slot: true}
        ],
        desserts: this.leaves
      }
      return table
    }
  },

  watch: {
    async 'filter.branch'(data) {
      this.filter.employee = []
      this.filteredEmployees = await _.reduce(this.employees, (pre, cur) => {
        if (cur.branch_id === data.id) pre.push(cur)
        return pre
      }, [])
    }
  },

  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await this.$axios.$get('/v2/api/leaves', {
          'params': {
            branch_id: this.filter.branch.id,
            from: this.$moment(this.filter.from_date).format('YYYY-MM-DD'),
            to: this.$moment(this.filter.to_date).format('YYYY-MM-DD'),
            withEmployee: true,
            workRule: true,
            times: true
          }
        })

        const leaves = this.filter.employee.length > 0 ? _.reduce(res, (pre, cur) => {
          cur.full_name = `${cur.employee.name} (${cur.employee.nickname})`
          cur.in_out = cur.work_rule ? `${this.$moment(`0000-01-01 ${cur.work_rule.work_start}`).format('HH:mm')} - ${this.$moment(`0000-01-01 ${cur.work_rule.work_end}`).format('HH:mm')}` : null
          cur.time = cur.work_rule !== null ? `${this.$moment(`0000-01-01 ${cur.work_rule.time}`).format('HH:mm')}` : null
          cur.force_time = cur.force_time !== null ? `${this.$moment(`0000-01-01 ${cur.force_time}`).format('HH:mm')}` : null
          let filteredEmployee = _.find(this.filter.employee, (item) => {
            return item.id === cur.employee_id
          })
          if (filteredEmployee && cur.type === -1 && cur.work_rule.night_shift && cur.employee.work_status) pre.push(cur)
          return pre
        }, []) : _.reduce(res, (pre, cur) => {
          cur.full_name = `${cur.employee.name} (${cur.employee.nickname})`
          cur.in_out = cur.work_rule ? `${this.$moment(`0000-01-01 ${cur.work_rule.work_start}`).format('HH:mm')} - ${this.$moment(`0000-01-01 ${cur.work_rule.work_end}`).format('HH:mm')}` : null
          cur.time = cur.work_rule !== null ? `${this.$moment(`0000-01-01 ${cur.work_rule.time}`).format('HH:mm')}` : null
          cur.force_time = cur.force_time !== null ? `${this.$moment(`0000-01-01 ${cur.force_time}`).format('HH:mm')}` : null
          if (cur.type === -1 && cur.work_rule.night_shift && cur.employee.work_status) pre.push(cur)
          return pre
        }, [])

        this.leaves = _.orderBy(leaves, ['leave_date'], ['desc'])
      } catch (e) {
        console.log(e)
        // this.errorAlert(e)
      }
      this.loading = false
    },
    show (data) {
      this.nightShiftModal = {
        open: true,
        data: data
      }
    },
    closeNightShiftModal () {
      this.nightShiftModal = {
        open: false,
        data: null
      }
    }
  }
}
</script>