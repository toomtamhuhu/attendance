import Vue from 'vue'
import axios from 'axios'

export default {
  namespaced: true,

  state: {
    data: []
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

    updateItem (state, payload) {
      const index = _.findIndex(state.data, { 'id': payload.id })
      if (index >= 0) Vue.set(state.data, index, payload)
      else state.data.push(payload)
    }
  },

  actions: {
    async fetch ({ commit }) {
      try {
        const res = await axios({
          method: "GET",
          url: process.env.graphqlUrl || 'http://hr.tsgoldprices.tk/graphql',
          data: {
            query: `{
            employees(work_status: true, branch_id: [15, 16, 17]) {
                id
                name
                nickname
                finger_print1
                finger_print2
                branch_id
                branch {
                  name
                }
              }
            }`
          }
        })
        commit('data', _.orderBy(res.data.data.employees, ['branch_id']))
      } catch (e) {
        throw e
      }
    }
  }
}