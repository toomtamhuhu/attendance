<template>
  <div>
    <v-tabs>
      <v-tab to="/attendances">ลงเวลา</v-tab>
      <v-tab to="/attendances/leaves" v-if="hasRole('HR') || hasRole('ADMIN')">กะงาน-วันหยุด</v-tab>
      <v-tab to="/attendances/reports" v-if="hasRole('HR') || hasRole('ADMIN')">รายงานลงเวลา</v-tab>
    </v-tabs>
    <br>
    <nuxt-child />
  </div>
</template>

<script>
export default {
  async fetch ({ store }) {
    store.dispatch('WorkRules/fetch')
  }
}
</script>