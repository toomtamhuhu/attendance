<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs10 offset-xs1>
        ATTENDANCE
      </v-flex>
      <v-flex xs8 offset-xs2>
        <v-form>
          <v-text-field
              v-focus-next
              v-model="form.username"
              label="Name"
          />
          <v-text-field
              v-focus-next
              v-model="form.password"
              type="password"
              label="Password"
          />
          <v-btn color="success" @click="login" :loading="loading">LOGIN</v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  layout: 'login',
  data () {
    return {
      loading: false,
      form: {
        username: null,
        password: null,
        grant_type: 'password',
        client_id: '2',
        client_secret: process.env.clientSecret
      },
    }
  },
  methods: {
    login: _.debounce(async function () {
      this.loading = true
      try {
        await this.$auth.loginWith('local', {
          data: this.form
        })
        this.$router.push('/')
      } catch (e) {
        this.errorAlert(e)
        this.loading = false
      }
    }, 300),
  }
}
</script>