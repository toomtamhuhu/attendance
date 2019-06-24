<template>
  <v-page>
    <div slot="content">
      <CreateOrEditButtonComponent :color="'info'" @closed="close" @submitted="save">
        <template slot="header">
          <v-card-title class="headline">ผู้ใช้</v-card-title>
        </template>

        <template v-slot:content>
          <v-card-text>
            <v-form>
              <v-text-field
                  v-focus-next
                  v-model="form.name"
                  label="ชื่อ"
              />

              <v-text-field
                  v-focus-next
                  v-model="form.username"
                  label="username"
              />

              <v-text-field
                  v-if="!form.id"
                  v-focus-next
                  v-model="form.password"
                  type="password"
                  label="password"
              />

            </v-form>
          </v-card-text>
        </template>
      </CreateOrEditButtonComponent>
      <v-divider class="my-3"/>
      <v-table :table="tableData">
        <template slot="info" slot-scope="{ data }">
          <v-btn small outline fab color="indigo" @click="show(data)">
            <v-icon>edit</v-icon>
          </v-btn>
        </template>
      </v-table>
    </div>
  </v-page>
</template>

<script>
import CreateOrEditButtonComponent from '@/components/layouts/CreateOrEditButtonComponent'
import gql from 'graphql-tag'

export default {
  components: {
    CreateOrEditButtonComponent
  },

  data () {
    return {
      dialog: false,
      users: [],
      form: {
        name: null,
        username: null,
        password: null
      }
    }
  },

  apollo: {
    users: gql`query {
      users {
        id
      	name
      	username
      }
    }`
  },

  computed: {
    tableData () {
      const table = {
        headers: [
          { text: 'name', value: 'name' },
          { text: 'username', value: 'username' },
          { text: 'ข้อมูล', value: 'info', sortable: false, slot: true },
        ],
        desserts: this.users
      }
      return table
    }
  },

  methods: {
    async show (data) {
      Object.assign(this.form, data)
      this.dialog = true
    },
    async save () {
      try {
        await this.$apollo.mutate({
          mutation: gql`mutation ($name: String!, $username: String!, $password: String!) {
          createUser(name: $name, username: $username, password: $password) {
              id
              name
              username
            }
          }`,
          variables: {
            name: this.form.name,
            username: this.form.username,
            password: this.form.password,
          },
          update: (store, { data: { createUser } }) => {
            this.updateCache(store, createUser)
          }
        })
      } catch (e) {
        console.log(e)
      } finally {
        this.resetForm()
      }
    },
    updateCache (store, data) {
      const query = {
        query: gql`query {
          users {
            id
            name
            username
          }
        }`,
      }
      const cache = store.readQuery(query)
      cache.users.push(data)
      // store.writeQuery({
      //   ...query,
      //   cache
      // })
    },
    close () {
      this.resetForm()
    },
    resetForm () {
      this.form = {
        name: null,
        username: null,
        password: null
      }
    }
  }
}
</script>