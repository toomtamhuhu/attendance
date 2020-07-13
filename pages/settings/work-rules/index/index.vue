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

            <div>
              <swatches v-model="form.color" />
            </div>

            <v-switch v-model="form.night_shift" flat label="กะดึก" color="indigo" />
            
            <div v-if="form.night_shift">
              <v-text-field
                v-model="time"
                label="เวลาสแกน"
                type="time"
              />

              <v-btn class="ma-2" tile outline color="success" @click="addTime()">
                เพิ่ม
              </v-btn>

              <v-table :table="workruleTimeTable">
                <span slot="time" slot-scope="{ data }">{{ `0000-01-01 ${data.time}` | moment('HH:mm') }}</span>
                <template slot="remove" slot-scope="{ data }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn small outline fab color="error" v-on="on" @click="removeTime(data)">
                        <v-icon>close</v-icon>
                      </v-btn>
                    </template>
                    <span>ลบ</span>
                  </v-tooltip>
                </template>
              </v-table>
            </div>
            
          </v-form>
        </v-card-text>
      </template>
    </v-create-update-button>
    <v-divider class="my-3"/>
    <v-table :table="tableData">
      <span slot="work_start" slot-scope="{ data }">{{ `0000-01-01 ${data.work_start}` | moment('HH:mm') }}</span>
      <span slot="work_end" slot-scope="{ data }">{{ `0000-01-01 ${data.work_end}` | moment('HH:mm') }}</span>
      <span slot="time" slot-scope="{ data }" v-if="data.night_shift">{{ `0000-01-01 ${data.time}` | moment('HH:mm') }}</span>
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
import swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'

export default {
  components: { swatches },
  data() {
    return {
      open: false,
      form: {
        name: null,
        short_name: null,
        work_start: '00:00',
        work_end: '12:00',
        ot: 0,
        note: null,
        color: '#1CA085',
        night_shift: false,
        time: '00:00',
        times: []
      },
      time: '00:00'
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
          {text: 'ข้อมูล', value: 'info', sortable: false, slot: true}
        ],
        desserts: this.work_rules
      }
      return table
    },
    workruleTimeTable() {
      const table = {
        headers: [
          {text: 'เวลา', value: 'time', slot: true},
          {text: 'ลบ', value: 'remove', sortable: false, slot: true}
        ],
        desserts: _.orderBy(this.form.times, ['time'])
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
      const res = await this.$axios.$delete(`v2/api/work-rules/${data.id}`)
      this.removeItem(res.data)
    },
    async save() {
      try {
        const res = await this.$axios.$post('v2/api/work-rules', this.form)
        this.addItem(res.data)
        this.noticeAlert(res)
      } catch (e) {
        console.log(e)
      } finally {
        this.resetForm()
      }
    },
    addTime () {
      const index = _.findIndex(this.form.times, { 'time': this.time } )
      if (index < 0) this.form.times.push({ 'time': this.time })
      else this.errorAlert('เพิ่มเวลาซ้ำไม่ได้')
    },
    async removeTime(data) {
      if (!confirm('ลบ?')) return
      const res = await this.$axios.$delete(`v2/api/work-rule-times/${data.id}`)
      const index = _.findIndex(this.form.times, { 'id': res.data.id })
      this.form.times.splice(index, 1)
    },
    resetForm() {
      this.open = false
      this.form = {
        name: null,
        short_name: null,
        work_start: null,
        work_end: null,
        ot: null,
        note: null,
        color: '#1CA085',
        night_shift: false,
        times: []
      }
      this.time = '00:00'
    },
    ...mapMutations({
      addItem: 'WorkRules/addItem',
      removeItem: 'WorkRules/removeItem'
    })
  }
}
</script>