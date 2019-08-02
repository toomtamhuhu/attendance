<template>
  <v-page>
    <div slot="content">
      <v-table :table="tableData">
        <template slot="work_rule" slot-scope="{ data }">
          <v-chip label :color="data.work_rule.color">{{ data.work_rule.short_name }}</v-chip>
        </template>
        <span slot="time" slot-scope="{ data }">{{ data.work_in_updated_at | moment('HH:mm') }}</span>
        <span slot="in_out" slot-scope="{ data }">{{ `0000-01-01 ${data.work_rule.work_start}` | moment('HH:mm') }} / {{ `0000-01-01 ${data.work_rule.work_end}` | moment('HH:mm') }}</span>
        <v-chip slot="late" slot-scope="{ data }" label :color="data.late === 0 ? 'success' : 'warning'" v-if="data.late !== null">{{ data.late | numeral }}</v-chip>
        <v-chip slot="wage" slot-scope="{ data }" label :color="data.wage === 0 ? 'error' : 'info'" v-if="data.late !== null">{{ data.wage | numeral }}</v-chip>
      </v-table>
    </div>
  </v-page>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      leaves: []
    }
  },

  computed: {
    tableData() {
      const table = {
        headers: [
          {text: 'ชื่อ', value: 'employee.name'},
          {
            text: 'วันที่',
            value: 'leave_date',
            callback: data => this.$moment(data.leave_date).locale('th').format('DD/MM/YY')
          },
          {text: 'กะ', value: 'work_rule', slot: true},
          {text: 'เวลา เข้า/ออก', value: 'in_out', slot: true},
          {text: 'ลงเวลา', value: 'time', slot: true},
          {text: 'สาย (นาที)', value: 'late', slot: true},
          {text: 'เบี้ยเลี้ยง', value: 'wage', slot: true}
        ],
        desserts: this.leaves
      }
      return table
    }
  },

  mounted() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      this.loading = true
      try {
        this.leaves = await this.$axios.$get('/v2/api/leaves', {
          'params': {
            from: this.$moment().format('YYYY-MM-DD'),
            to: this.$moment().format('YYYY-MM-DD'),
            state: 'work_in_state',
            withEmployee: true,
            workRule: true
          }
        })
        this.leaves = res
      } catch (e) {
        // this.errorAlert(e)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>