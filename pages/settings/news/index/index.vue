<template>
  <v-page>
    <div slot="content">
      <v-create-update-button :open="open" :color="'info'" @closed="resetForm" @submitted="save">
        <template slot="header">
          <v-card-title class="headline">ข่าวสาร</v-card-title>
        </template>

        <template v-slot:content>
          <v-card-text>
            <vue-editor v-model="form.description" />
          </v-card-text>
        </template>
      </v-create-update-button>
      <v-divider class="my-3"/>
      <v-table :table="tableData">
        <v-textarea
            slot="description"
            slot-scope="{ data }"
            readonly
            :value="data.description"
        />
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
import { VueEditor } from 'vue2-editor'

export default {
  components: {
    VueEditor
  },

  data() {
    return {
      open: false,
      form: {
        description: null,
      }
    }
  },

  computed: {
    ...mapGetters({
      news: 'News/data'
    }),
    tableData() {
      const table = {
        headers: [
          {text: 'วันที่', value: 'created_at', callback: data => this.$moment(data.created_at).locale('th').format('DD/MM/YY') },
          {text: 'รายละเอียด', value: 'description', slot: true},
          {text: 'ข้อมูล', value: 'info', sortable: false, slot: true},
        ],
        desserts: this.news
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
      if (!confirm('ลบ?')) return
      try {
        const res = await this.$axios.$delete(`v2/api/news/${data.id}`)
        this.removeItem(res.data)
        this.noticeAlert(res)
      } catch (e) {
        console.log(e)
      }
    },
    async save() {
      try {
        const res = await this.$axios.$post('v2/api/news', this.form)
        this.addItem(res.data)
        this.noticeAlert(res)
      } catch (e) {
        console.log(e)
      } finally {
        this.resetForm()
      }
    },
    resetForm() {
      this.open = false
      this.form = {
        description: null,
      }
    },
    ...mapMutations({
      addItem: 'News/addItem',
      removeItem: 'News/removeItem'
    })
  }
}
</script>