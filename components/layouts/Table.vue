<template>
  <div>
    <v-card v-if="table">
      <div>
        <v-card-title>
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <v-text-field
              v-if="tableData.search"
              v-model="search"
              append-icon="search"
              label="ค้นหา"
              single-line
              hide-details
          />
        </v-card-title>
      </div>
      <v-data-table
          :headers="tableData.headers"
          :items="tableData.desserts"
          :rows-per-page-items="[25,50,100]"
          :custom-sort="customSort"
          :loading="loading"
          class="elevation-1"
      >
        <template v-slot:items="props">
          <template v-for="(f, i) in tableData.headers">
            <template>
              <td :key="i" v-if="f.slot">
                <slot v-if="f.slot" :name="f.value" :data="props.item" />
              </td>
              <td :key="i" v-else>{{ f.callback ? f.callback(props.item) : getObjectData(props.item, f) }}</td>
            </template>
          </template>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  asyncData ({ params }) {
  },

  props: {
    table: {
      type: Object
    },
    loading: {
      type: Boolean
    }
  },

  data () {
    return {
      search: '',
      pagination: {},
    }
  },

  created() {

  },

  computed: {
    tableData () {
      return {
        headers: this.table.headers ? this.table.headers : [],
        desserts: this.table.desserts ? this.table.desserts : [],
        search: typeof this.table.search !== 'undefined' ? this.table.search : true,
      }
    }
  },

  methods: {
    getObjectData (data, field) {
      let v = data[field.value]
      if (typeof data[field.value] === 'undefined') {
        const s = field.value.substring(0, field.value.indexOf('.'))
        field.value.split('.').forEach(key => {
          if (typeof data[s][key] !== 'undefined') v = data[s][key]
        })
      }
      return v
    },
    customSort(items, index, isDescending) {
      items.sort((a, b) => {
        let dateA = new Date(a.leave_date), dateB = new Date(b.leave_date)

        if (index === 'work_rule') {
          if (isDescending) {
            return b.work_rule.short_name.localeCompare(a.work_rule.short_name)
          } else {
            return a.work_rule.short_name.localeCompare(b.work_rule.short_name)
          }
        }

        if (index === 'leave_date') {
          if (isDescending) {
            return dateB - dateA
          } else {
            return dateA - dateB
          }
        }

        if (index === 'in_out') {
          if (isDescending) {
            return b.in_out.localeCompare(a.in_out)
          } else {
            return a.in_out.localeCompare(b.in_out)
          }
        }

        // if (index === 'work_in') {
        //   if (isDescending) {
        //     return b.work_in.localeCompare(a.work_in)
        //   } else {
        //     return a.work_in.localeCompare(b.work_in)
        //   }
        // }
        //
        // if (index === 'work_out') {
        //   if (isDescending) {
        //     return b.work_out.localeCompare(a.work_out)
        //   } else {
        //     return a.work_out.localeCompare(b.work_out)
        //   }
        // }

        return dateB - dateA
      })

      return items
    }
  }
}
</script>