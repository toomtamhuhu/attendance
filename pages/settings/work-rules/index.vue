<template>
  <div>
    <v-tabs>
      <v-tab to="/settings/work-rules">กะงาน</v-tab>
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