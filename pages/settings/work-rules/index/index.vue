<template>
<v-page>
  <div slot="content">
    <v-create-update-button :open="open" :color="'info'" @closed="resetForm" @submitted="save">
      <template slot="header">
        <v-card-title class="headline">กะงาน</v-card-title>
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
                v-model="form.short_name"
                label="ตัวย่อ"
            />

            <v-text-field
                v-focus-next
                v-model="form.work_start"
                label="เข้างาน"
                type="time"
            />

            <v-text-field
                v-focus-next
                v-model="form.work_end"
                label="ออกงาน"
                type="time"
            />

            <v-text-field
                v-focus-next
                v-model="form.ot"
                label="ot"
            />

            <v-text-field
                v-focus-next
                v-model="form.note"
                label="หมายเหตุ"
            />

          </v-form>
        </v-card-text>
      </template>
    </v-create-update-button>
    <v-divider class="my-3"/>
    <v-table :table="tableData">
      <span slot="work_start" slot-scope="{ data }">{{ `0000-01-01 ${data.work_start}` | moment('HH:mm') }}</span>
      <span slot="work_end" slot-scope="{ data }">{{ `0000-01-01 ${data.work_end}` | moment('HH:mm') }}</span>
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
import { mapGetters, mapMutations } from 'vuex'
import axios from 'axios'

export default {
  data() {
    return {
      open: false,
      form: {
        name: null,
        short_name: null,
        work_start: '00:00',
        work_end: '12:00',
        ot: 0,
        note: null
      }
    }
  },

  computed: {
    ...mapGetters({
      work_rules: 'WorkRules/data'
    }),
    tableData() {
      const table = {
        headers: [
          {text: 'ชื่อ', value: 'name'},
          {text: 'ตัวย่อ', value: 'short_name'},
          {text: 'เข้างาน', value: 'work_start', slot: true},
          {text: 'ออกงาน', value: 'work_end', slot: true},
          {text: 'ข้อมูล', value: 'info', sortable: false, slot: true},
        ],
        desserts: this.work_rules
      }
      return table
    }
  },

  methods: {
    async show(data) {
      Object.assign(this.form, data)
      this.open = true
    },
    async remove(data) {
      if (!confirm('ลบกะงาน?')) return
      // await this.$apollo.mutate({
      //   mutation: gql`mutation ($id: ID!) {
      //     deleteUser(id: $id) {
      //         id
      //         name
      //         username
      //       }
      //     }`,
      //   variables: {
      //     id: data.id
      //   },
      //   update: (store, {data: {deleteUser}}) => {
      //     this.updateCache(store, deleteUser, 'deleted')
      //   }
      // })
    },
    async save() {
      try {
        if (this.form.id) {
          const res = await axios({
            method: 'POST',
            url: 'http://vue-hrm.huhu/graphql',
            data: {
              query: `mutation ($id: ID!, $name: String!, $short_name: String!, $work_start: String!, $work_end: String!, $ot: Int!, $note: String) {
              updateWorkRule(id: $id, name: $name, short_name: $short_name, work_start: $work_start, work_end: $work_end, ot: $ot, note: $note) {
                  id
                  name
                  short_name
                  work_start
                  work_end
                  ot
                  note
                }
              }`,
              variables: {
                id: this.form.id,
                name: this.form.name,
                short_name: this.form.short_name,
                work_start: this.form.work_start,
                work_end: this.form.work_end,
                ot: this.form.ot,
                note: this.form.note
              }
            }
          })
          if(res.status === 200) this.addItem(res.data.data.updateWorkRule)
        } else {
          const res = await axios({
            method: 'POST',
            url: 'http://vue-hrm.huhu/graphql',
            data: {
              query: `mutation ($name: String!, $short_name: String!, $work_start: String!, $work_end: String!, $ot: Int!, $note: String) {
              createWorkRule(name: $name, short_name: $short_name, work_start: $work_start, work_end: $work_end, ot: $ot, note: $note) {
                  id
                  name
                  short_name
                  work_start
                  work_end
                  ot
                  note
                }
              }`,
              variables: {
                name: this.form.name,
                short_name: this.form.short_name,
                work_start: this.form.work_start,
                work_end: this.form.work_end,
                ot: this.form.ot,
                note: this.form.note
              }
            }
          })
          if(res.status === 200) this.addItem(res.data.data.createWorkRule)
        }
      } catch (e) {
        console.log(e)
      } finally {
        this.resetForm()
      }
    },
    resetForm() {
      this.open = false
      this.form = {
        name: null,
        short_name: null,
        work_start: null,
        work_end: null,
        ot: null,
        note: null
      }
    },
    ...mapMutations({
      addItem: 'WorkRules/addItem',
      removeItem: 'WorkRules/removeItem'
    })
  }
}
</script>