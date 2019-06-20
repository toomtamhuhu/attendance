<template>
  <div>
    <v-card>
      <div>
        <v-card-title>
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <v-text-field
              v-model="tableData.search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
          ></v-text-field>
        </v-card-title>
      </div>
      <v-data-table
          :headers="tableData.headers"
          :items="tableData.desserts"
          :search="tableData.search"
          hide-actions
          :pagination.sync="pagination"
          class="elevation-1"
      >
        <template v-slot:items="props">
          <div>{{ props }}</div>
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.calories }}</td>
          <td class="text-xs-right">{{ props.item.fat }}</td>
          <td class="text-xs-right">{{ props.item.carbs }}</td>
          <td class="text-xs-right">{{ props.item.protein }}</td>
          <td class="text-xs-right">{{ props.item.iron }}</td>
        </template>
      </v-data-table>
      <div class="text-xs-center pt-2">
        <v-pagination v-model="pagination.page" :length="pages"></v-pagination>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    table: {
      type: Object
    }
  },

  data () {
    return {
      pagination: {},
    }
  },

  computed: {
    tableData () {
      return {
        headers: this.table.headers ? this.table.headers : [],
        desserts: this.table.desserts ? this.table.desserts : [],
        search: '',
      }
    },
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0

      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    }
  }
}
</script>