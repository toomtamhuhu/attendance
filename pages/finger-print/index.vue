<template>
  <div>
    <v-tabs>
      <v-tab to="/settings/finger-print">เพิ่มนิ้ว พนง.</v-tab>
    </v-tabs>
    <br>
    <v-page>
      <div slot="content">
        <v-table :table="tableData">
          <template slot="finger_print" slot-scope="{ data }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn flat icon :color="data.finger_print ? 'success' : 'error'" v-on="on" @click="show(data)">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
              <span>สแกนนิ้ว</span>
            </v-tooltip>
          </template>
        </v-table>
      </div>
    </v-page>
    <ManageFingerPrintModal :data="modalFingerPrint.item" :open="modalFingerPrint.open" @closed="closeModalFingerPrint" @onSubmitted="updateFingerPrint"/>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import axios from "axios"
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
        item: null
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
          {text: 'สแกนนิ้ว', value: 'finger_print', slot: true}
        ],
        desserts: this.employees
      }
      return table
    }
  },

  methods: {
    show(data) {
      this.modalFingerPrint = {
        open: true,
        item: data
      }
    },
    closeModalFingerPrint() {
      this.modalFingerPrint = {
        open: false,
        name: null
      }
    },
    updateFingerPrint (data) {
      this.$store.commit('Employees/updateItem', data)
    },
  }
}
</script>