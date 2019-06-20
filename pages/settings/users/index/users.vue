<template>
  <v-page>
    <div slot="content">
      <CreateOrEditButtonComponent :dialog="dialog" :color="'info'">
        <template slot="content">
          <v-card>
            <v-card-title class="headline">Use Google's location service?</v-card-title>

            <v-card-text>
              Let Google help apps determine location. This means sending anonymous location data to Google, even when no
              apps are running.
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                  color="green darken-1"
                  flat="flat"
                  @click="dialog = false"
              >
                Disagree
              </v-btn>

              <v-btn
                  color="green darken-1"
                  flat="flat"
                  @click="dialog = false"
              >
                Agree
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </CreateOrEditButtonComponent>
      <v-table :table="tableData" />
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
      users: []
    }
  },

  apollo: {
    users: gql`query {
      users {
      	name,
      	username
      }
    }`,
  },

  computed: {
    tableData () {
      const table = {
        headers: [
          { text: 'name', value: 'name' },
          { text: 'username', value: 'username' },
        ],
        desserts: this.users
      }
      return table
    }
  }
}
</script>