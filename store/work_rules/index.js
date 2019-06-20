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
    }
  },

  actions: {
    async fetch ({ commit }) {
      try {
        const res = await this.$axios.$get('/api/work-rules')
        commit('data', _.orderBy(res, ['name']))
      } catch (e) {
        throw e
      }
    }
  }
}