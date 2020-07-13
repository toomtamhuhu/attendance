import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'

export default {
  namespaced: true,

  state: {
    data: [],
    loading: false,
    times: []
  },

  getters: {
    data (state) {
      return state.data
    }
  },

  mutations: {
    data (state, payload) {``
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
    },
    addTime (state, payload) {
      const index = _.findIndex(state.data.times, { 'time': payload.time } )
      if (index < 0) return state.data.times.push(payload)

      Vue.set(state.data.times, index, payload)
    }
  },

  actions: {
    async fetch ({ commit, state }, payload) {
      state.loading = true
      try {
        const res = await this.$axios.$get('/v2/api/work-rules', { 'params': payload })
        _.map(res, item => {
          item.full_name = `${item.name} ` + moment(`0000-01-01 ${item.work_start}`).format('HH:mm') + '-' + moment(`0000-01-01 ${item.work_end}`).format('HH:mm')
          return item
        })
        commit('data', _.orderBy(res, ['name']))
      } catch (e) {
        throw e
      } finally {
        state.loading = false
      }
    }
  }
}