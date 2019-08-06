import Vue from 'vue'

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
    addItem (state, payload) {
      const index = _.findIndex(state.data, { 'id': payload.id })
      if (index >= 0) Vue.set(state.data, index, payload)
      else state.data.push(payload)
    },
    removeItem (state, payload) {
      const index = _.findIndex(state.data, { 'id': payload.id })
      state.data.splice(index, 1)
    }
  },

  actions: {
    async fetch ({ commit}, payload) {
      try {
        const res = await this.$axios.$get('/v2/api/news', { 'params': payload })
        commit('data', res)
      } catch (e) {
        throw e
      }
    }
  }
}