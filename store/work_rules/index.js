import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'

export default {
  namespaced: true,

  state: {
    data: [],
    loading: false
  },

  getters: {
    data (state) {
      return state.data
    }
  },

  mutations: {
    data (state, payload) {
      state.data = payload
    },
    addItem (state, payload) {
      const index = _.findIndex(state.data, { 'id': payload.id } )
      if (index < 0) return state.data.push(payload)

      Vue.set(state.data, index, payload)
    },
    removeItem (state, payload) {
      const index = _.findIndex(state.data, { 'id': payload.id })
      state.data.splice(index, 1)
    }
  },

  actions: {
    async fetch ({ commit, state }) {
      state.loading = true
      try {
        const res = await axios({
          method: 'GET',
          url: process.env.graphqlUrl || 'http://hr.tsgoldprices.tk/graphql',
          data: {
            query: `{
            work_rules {
                id
                name
                short_name
                work_start
                work_end
                ot
                note
                color
                night_shift
                time
              }
            }`
          }
        })
        _.map(res.data.data.work_rules, item => {
          item.full_name = `${item.name} ` + moment(`0000-01-01 ${item.work_start}`).format('HH:mm') + '-' + moment(`0000-01-01 ${item.work_end}`).format('HH:mm')
          return item
        })
        commit('data', _.orderBy(res.data.data.work_rules, ['name']))
      } catch (e) {
        throw e
      } finally {
        state.loading = false
      }
    }
  }
}