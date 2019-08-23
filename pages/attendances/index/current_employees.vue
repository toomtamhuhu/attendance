<template>
  <v-page>
    <div slot="content">
      <v-table :table="tableData">
        <template slot="work_rule" slot-scope="{ data }" v-if="data.work_rule">
          <v-chip label :color="data.work_rule.color">{{ data.work_rule.short_name }}</v-chip>
        </template>
        <span slot="time" slot-scope="{ data }">{{ data.work_in_updated_at | moment('HH:mm') }}</span>
        <span slot="in_out" slot-scope="{ data }" v-if="data.work_rule">{{ `0000-01-01 ${data.work_rule.work_start}` | moment('HH:mm') }} / {{ `0000-01-01 ${data.work_rule.work_end}` | moment('HH:mm') }}</span>
        <v-chip slot="late" slot-scope="{ data }" label :color="data.late === 0 ? 'success' : 'warning'" v-if="data.late !== null">{{ data.late | numeral }}</v-chip>
        <v-chip slot="wage" slot-scope="{ data }" label :color="data.wage === 0 ? 'error' : 'info'" v-if="data.late !== null">{{ data.wage | numeral }}</v-chip>
      </v-table>
    </div>
  </v-page>
</template>

<script>
export default {
  async asyncData  ({ app }) {
    try {
      const leaves = await app.$axios.$get('/v2/api/leaves', {
        'params': {
          from: app.moment().startOf('month').format('YYYY-MM-DD'),
          to: app.moment().endOf('month').format('YYYY-MM-DD'),
          state: 'work_in_state',
          withEmployee: true,
          workRule: true,
          branch: true
        }
      })

      const filteredLeaves = _.reduce(leaves, (pre, cur) => {
        if (app.moment().diff(app.moment(cur.leave_date), 'days') === 0 && !cur.work_out_state) pre.push(cur)
        return pre
      }, [])
      return { leaves: _.orderBy(filteredLeaves, ['work_rule.work_start'], ['desc'])}
    } catch (e) {
      console.log(e)
    }
  },

  data() {
    return {
      loading: false
    }
  },

  computed: {
    tableData() {
      const table = {
        headers: [
          {text: 'ชื่อ', value: 'employee', callback: data => `${data.employee.name} (${data.employee.nickname})`},
          {text: 'สถานที่', value: 'branch', callback: data => data.branch ? `${data.branch.name}` : '-'},
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
  }
}
</script>