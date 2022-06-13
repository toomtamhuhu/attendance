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
    async fetch ({ commit, state }, payload) {
      try {
        const res = await this.$axios.$get('/v2/api/branches/filter', { 'params': payload })
        commit('data', res)
      } catch (e) {
        throw e
      }
    }
  }
}