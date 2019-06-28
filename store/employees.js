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
          url: "http://vue-hrm.huhu/graphql",
          data: {
            query: `{
            employees(work_status: true) {
                id
                name
                nickname
                finger_print
                branch_id
                branch {
                  name
                }
              }
            }`
          }
        })
        const employees = _.reduce(res.data.data.employees, (pre, cur) => {
          if (cur.branch_id === 16 || cur.branch_id === 17) pre.push(cur)
          return pre
        }, [])
        commit('data', _.orderBy(employees, ['branch_id']))
      } catch (e) {
        throw e
      }
    }
  }
}