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
        const res = await this.$axios.$get('/api/branches')
        commit('data', _.orderBy(_.reduce(res, (pre, cur) => {
          if (cur.department_id === 4) pre.push(cur)
          return pre
        }, []), ['name']))
      } catch (e) {
        throw e
      }
    }
  }
}