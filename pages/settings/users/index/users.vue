<template>
  <v-page>
    <div slot="content">
      <v-create-update-button :open="open" :color="'info'" @closed="resetForm" @submitted="save">
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
      </v-create-update-button>
      <v-divider class="my-3"/>
      <v-table :table="tableData">
        <template slot="info" slot-scope="{ data }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn small outline fab color="indigo" v-on="on" @click="show(data)">
                <v-icon>edit</v-icon>
              </v-btn>
            </template>
            <span>ข้อมูล</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn small outline fab color="error" v-on="on" @click="remove(data)">
                <v-icon>close</v-icon>
              </v-btn>
            </template>
            <span>ลบ</span>
          </v-tooltip>
        </template>
      </v-table>
    </div>
  </v-page>
</template>

<script>
export default {
  data () {
    return {
      open: false,
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
      this.open = true
    },
    async remove (data) {
      if (!confirm('ลบผู้ใช้?')) return
      await this.$apollo.mutate({
        mutation: gql`mutation ($id: ID!) {
          deleteUser(id: $id) {
              id
              name
              username
            }
          }`,
        variables: {
          id: data.id
        },
        update: (store, { data: { deleteUser } }) => {
          this.updateCache(store, deleteUser, 'deleted')
        }
      })
    },
    async save () {
      try {
        if (this.form.id) {
          await this.$apollo.mutate({
            mutation: gql`mutation ($id: ID!, $name: String!, $username: String!) {
              updateUser(id: $id, name: $name, username: $username) {
                  id
                  name
                  username
                }
              }`,
            variables: {
              id: this.form.id,
              name: this.form.name,
              username: this.form.username
            }
          })
        } else {
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
              this.updateCache(store, createUser, 'created')
            }
          })
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.resetForm()
      }
    },
    updateCache (store, data, state) {
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
      if (state === 'created') {
        cache.users.push(data)
      } else {
        const index = cache.users.indexOf(data)
        cache.users.splice(index, 1)
      }
      // store.writeQuery({
      //   ...query,
      //   cache
      // })
    },
    close () {
      this.resetForm()
    },
    resetForm () {
      this.open = false
      this.form = {
        name: null,
        username: null,
        password: null
      }
    }
  }
}
</script>