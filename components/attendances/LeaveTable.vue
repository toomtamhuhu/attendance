<template>
  <div v-if="tableItems.length > 0" class="wrapper">
    <table>
      <thead>
      <tr>
        <th/>
        <th v-for="(date, i) in days" :style="dateStyle(date)" :key="i" class="has-text-centered">
          {{ date | moment('DD') }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="data in tableItems" :key="data.id">
        <th>{{ data.nickname }} {{ data.name }}</th>
        <td
            v-for="(item, i) in data.leaves"
            :key="i"
            class="has-text-centered holidayCell"
            @click="$emit('onCellClick', [days[i], data ])"
        >
          <div
              v-if="item"
              :style="{ backgroundColor: changeTypeToObj(item, true), textAlign: 'center' }"
              class="leaveBlock"
          >
            <span v-if="item">{{ changeTypeToObj(item) }}</span>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    },
    month: {
      type: [Object, String],
      default() {
        return this.$moment().format('YYYY-MM-DD')
      }
    }
  },

  data () {
    return {
      types: [{ value: -1, name: 'กะงาน'}, { value: 0, name: 'หยุด'}, { value: 1, name: 'ลากิจ'}, { value: 2, name: 'ลาป่วย'}],
    }
  },

  computed: {
    days() {
      let startOf = this.$moment(this.month).startOf('month').format('YYYY-MM-DD')
      const endOf = this.$moment(this.month).endOf('month').format('YYYY-MM-DD')
      let days = []
      while (startOf <= endOf) {
        days.push(startOf)
        startOf = this.$moment(startOf).add(1, 'days').format('YYYY-MM-DD')
      }
      return days
    },
    tableItems() {
      let employees = _.map(this.data, item => {
        let leaves = []

        for (let day in this.days) {
          const leave = _.find(item.leaves, {'leave_date': this.days[day]})
          leaves.push(leave)
        }

        item.leaves = leaves
        return item
      })

      return employees
    },
    ...mapGetters({
      work_rules: 'WorkRules/data'
    })
  },

  methods: {
    dateStyle(date) {
      return {'color': this.$moment(date).locale('th').format('dddd') === 'อาทิตย์' ? 'red' : null}
    },
    changeTypeToObj(data, style) {
      if(typeof data.type === 'number') data.type = _.find(this.types, {'value': data.type})
      let work_rule = _.find(this.work_rules, {'id': data.work_rule_id})

      if (style) {
        return data.type.value === -1 ? work_rule.color : data.type.value === 1 ? '#36f' : data.type.value === 2 ? '#f63' : '#852'
      } else {
        return data.type.value === -1
          ? typeof work_rule !== 'undefined'
            ? work_rule.short_name
            : data.type.name
          : data.type.name
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .wrapper {
    overflow: auto;
    margin-left: 15rem;
  }

  table {
    width: 100%;

    tr:not(:last-child) {
      border-bottom: 1px solid #666;
    }

    td, th {
      height: 35px;
      padding: 5px 5px;
      white-space: nowrap;

      &:first-child {
        position: absolute;
        left: 0;
        padding: 5px 30px;
      }

      .leaveBlock {
        color: #fff;
        display: block;
        min-height: 25px;
        border-radius: 5px;
      }

      &.holidayCell {
        cursor: pointer;

        &:hover {
          background-color: #feffa8;
          border-radius: 5px;
        }
      }
    }
  }

  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    background-color: #e4f2fe;
  }

  ::-webkit-scrollbar {
    width: 12px;
    height: 8px;
    background-color: #93c0fe;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
    background-color: #93c0fe;
  }
</style>
