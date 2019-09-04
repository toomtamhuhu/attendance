<template>
  <div>
    <v-tabs>
      <v-tab to="/attendances">ลงเวลา</v-tab>
      <v-tab to="/attendances/leaves" v-if="hasRole('HR') || hasRole('ADMIN')">กะงาน-วันหยุด</v-tab>
      <v-tab to="/attendances/reports" v-if="hasRole('HR') || hasRole('ADMIN')">ดูลงเวลา</v-tab>
      <v-tab to="/attendances/report_night_shifts" v-if="hasRole('HR') || hasRole('ADMIN')">รายงานสแกนกะดึก</v-tab>
      <v-tab to="/attendances/current_employees" v-if="hasRole('HR') || hasRole('ADMIN')">พนักงานกะปัจจุบัน</v-tab>
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