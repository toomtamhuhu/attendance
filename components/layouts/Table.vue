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
        // default sort by leave_date
        if (isDescending) {
          let v =_.findIndex(this.tableData.headers, (item) => {
            return item.value === index
          })

          if (index === this.tableData.headers[v].value) {
            if (a[`${this.tableData.headers[v].value}`] !== null && typeof a[`${this.tableData.headers[v].value}`] !== 'object') {
              return a[`${this.tableData.headers[v].value}`].localeCompare(b[`${this.tableData.headers[v].value}`])
            } else {
              return a - b
            }
          }
        }

        // default sort by first column on table headers
        // if (isDescending !== null) {
        //   let v =_.findIndex(this.tableData.headers, (item) => {
        //     return item.value === index
        //   })
        //
        //   if (index === this.tableData.headers[v].value) {
        //     if (isDescending) {
        //       return b[`${this.tableData.headers[v].value}`].localeCompare(a[`${this.tableData.headers[v].value}`])
        //     } else {
        //       return a[`${this.tableData.headers[v].value}`].localeCompare(b[`${this.tableData.headers[v].value}`])
        //     }
        //   }
        // }

        if (a.leave_date) {
          return b.leave_date.localeCompare(a.leave_date)
        } else {
          return b - a
        }
      })

      return items
    }
  }
}
</script>