<template>
  <v-container grid-list-md text-xs-center>
    <v-layout row wrap>
      <v-flex xs10 offset-xs1>
        โปรแกรมลงเวลา เวอร์ชั่น{{ version }}
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
          <v-btn color="success" @click="login" :loading="loading">เข้าสู่ระบบ</v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { remote, ipcRenderer } from 'electron'

export default {
  layout: 'login',
  data () {
    return {
      version: remote.app.getVersion(),
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

  created () {
    ipcRenderer.send('defaultUser')
    ipcRenderer.once('defaultUser', (event, arg) => {
      if (arg) {
        this.form.username = arg.username
        this.form.password = arg.password
      }
    })
  },

  mounted () {
    ipcRenderer.send('startFingerScanner')
  },

  methods: {
    login: _.debounce(async function () {
      this.loading = true
      try {
        await this.$auth.loginWith('local', {
          data: this.form
        })
        ipcRenderer.send('setDefaultUser', {
          "username": this.form.username,
          "password": this.form.password
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