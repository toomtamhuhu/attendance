<template>
  <div>
    <v-tabs>
      <v-tab to="/settings/finger-print">เพิ่มนิ้ว พนง.</v-tab>
    </v-tabs>
    <br>
    <v-page>
      <div slot="content">
        <v-divider class="my-3"/>
        <v-table :table="tableData">
          <template slot="finger_print1" slot-scope="{ data }">
            <v-tooltip v-if="data.finger_print1" bottom>
              <template v-slot:activator="{ on }">
                <v-btn style="cursor: default" flat icon color="success" v-on="on">
                  <v-icon>check</v-icon>
                </v-btn>
              </template>
              <span>สแกนนิ้ว</span>
            </v-tooltip>
            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on }">
                <v-btn flat icon color="error" v-on="on" @click="show(data, 1)">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
              <span>สแกนนิ้ว</span>
            </v-tooltip>
          </template>

          <template slot="finger_print2" slot-scope="{ data }">
            <v-tooltip v-if="data.finger_print2" bottom>
              <template v-slot:activator="{ on }">
                <v-btn style="cursor: default" flat icon color="success" v-on="on">
                  <v-icon>check</v-icon>
                </v-btn>
              </template>
              <span>สแกนนิ้ว</span>
            </v-tooltip>
            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on }">
                <v-btn flat icon color="error" v-on="on" @click="show(data, 2)">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
              <span>สแกนนิ้ว</span>
            </v-tooltip>
          </template>
        </v-table>
      </div>
    </v-page>
    <ManageFingerPrintModal :data="modalFingerPrint.item" :open="modalFingerPrint.open" :number="modalFingerPrint.number" @closed="closeModalFingerPrint" @onSubmitted="updateFingerPrint"/>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ManageFingerPrintModal from '@/components/finger-prints/ManageFingerPrintModal'

export default {
  async fetch ({ store }) {
    store.dispatch('Employees/fetch')
  },

  components: {
    ManageFingerPrintModal
  },

  data() {
    return {
      modalFingerPrint: {
        open: false,
        item: null,
        number: null
      }
    }
  },

  computed: {
    ...mapGetters({
      employees: 'Employees/data'
    }),
    tableData() {
      const table = {
        headers: [
          {text: 'ชื่อ', value: 'name'},
          {text: 'ชื่อเล่น', value: 'nickname'},
          {text: 'สาขา', value: 'branch.name'},
          {text: 'นิ้ว1', value: 'finger_print1', slot: true},
          {text: 'นิ้ว2', value: 'finger_print2', slot: true}
        ],
        desserts: this.employees
      }
      return table
    }
  },

  methods: {
    show(data, number) {
      this.modalFingerPrint = {
        open: true,
        item: data,
        number: number
      }
    },
    closeModalFingerPrint() {
      this.modalFingerPrint = {
        open: false,
        name: null,
        number: null
      }
    },
    updateFingerPrint (data) {
      this.$store.commit('Employees/updateItem', data)
    },
  }
}
</script>