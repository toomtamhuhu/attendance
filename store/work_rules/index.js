import Vue from 'vue'
import axios from 'axios'

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
  },

  actions: {
    async fetch ({ commit, state }) {
      state.loading = true
      try {
        const res = await axios({
          method: 'GET',
          url: 'http://vue-hrm.huhu/graphql',
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
              }
            }`
          }
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