<template>
  <div>
    <v-tabs>
      <v-tab to="/settings/users/users">ผู้ใช่</v-tab>
      <v-tab to="/settings/users/permissions">permissions</v-tab>
    </v-tabs>
    <br>
    <nuxt-child />
  </div>
</template>

<script>
export default {
  middleware: [({route, redirect}) => {
    if (route.fullPath === '/settings/users') redirect('/settings/users/users')
  }]
}
</script>