export default {
  namespaced: true,

  state: {
    data: null
  },

  getters: {
    data (state) {
      return state.data
    },
    can: state => permission => {
      if (typeof permission !== 'object') {
        const item = _.find(state.data, { 'name': permission })
        return typeof item !== 'undefined'
      } else {
        for (const p in permission) {
          const item = _.find(state.data, { 'name': permission[p] })
          if (typeof item !== 'undefined') return true
        }
        return false
      }
    }
  },

  mutations: {
    data (state, payload) {
      state.data = payload
    }
  }
}