<template>
  <div>
    <v-tabs>
      <v-tab to="/settings/news">ข่าวสาร</v-tab>
    </v-tabs>
    <br>
    <nuxt-child />
  </div>
</template>

<script>
export default {
  async fetch({store}) {
    store.dispatch('News/fetch')
  }
}
</script>