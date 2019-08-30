import axios from 'axios'

export default {
  namespaced: true,

  state: {
    data: [],
    active: null,
    branches: []
  },

  getters: {
    data (state) {
      return state.data
    },
    active (state) {
      return state.active
    },
    branch: state => id => {
      return _.find(state.data, { 'id': id })
    }
  },

  mutations: {
    data (state, payload) {
      state.data = payload
    },
    active (state, payload) {
      if (typeof payload === 'object') state.active = payload
    }
  },

  actions: {
    async fetch ({ commit, state }) {
      try {
        const res = await axios({
          method: "GET",
          url: process.env.graphqlUrl || 'http://hr.tsgoldprices.tk/graphql',
          data: {
            query: `{
            branchesByDept(department_id: [3, 4, 8]) {
                id
                name
              }
            }`
          }
        })
        let g9 = _.find(res.data.data.branchesByDept, { 'id': 15 })
        let ws = _.find(res.data.data.branchesByDept, { 'id': 16 })
        let ch = _.find(res.data.data.branchesByDept, { 'id': 17 })
        let fn = _.find(res.data.data.branchesByDept, { 'id': 21 })
        state.branches.push(ws, ch, g9, fn)
        commit('data', state.branches)
      } catch (e) {
        throw e
      }
    }
  }
}