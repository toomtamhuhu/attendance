import axios from 'axios'

export default {
  namespaced: true,

  state: {
    data: [],
    active: null,
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
    async fetch ({ commit }) {
      try {
        const res = await axios({
          method: "GET",
          url: process.env.graphqlUrl || 'http://hr.tsgoldprices.tk/graphql',
          data: {
            query: `{
            branchesByDept(department_id: 4) {
                id
                name
              }
            }`
          }
        })
        commit('data', _.orderBy(res.data.data.branchesByDept, ['name']))
      } catch (e) {
        throw e
      }
    }
  }
}