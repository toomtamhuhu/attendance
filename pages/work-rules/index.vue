<template>
  <div>
    WORK
  </div>
</template>

<script>
export default {
  async fetch ({ store }) {
    store.dispatch('WorkRules/fetch')
  }
}
</script>