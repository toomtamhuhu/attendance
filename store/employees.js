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
    async fetch ({ commit, state }, payload) {
      try {
        const res = await this.$axios.$get('/v2/api/employees/filter', { 'params': payload })
        commit('data', _.orderBy(res, ['branch_id']))
      } catch (e) {
        throw e
      }
    }
  }
}