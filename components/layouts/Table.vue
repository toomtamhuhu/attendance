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
          :search="search"
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
        if (index === 'leave_date') {
          if (isDescending) {
            return b.leave_date - a.leave_date;
          } else {
            return a.leave_date - b.leave_date;
          }
        }
        // return a - b
      })

      return items
    }
  }
}
</script>