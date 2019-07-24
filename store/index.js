import Vuex from 'vuex'
import axios from 'axios'

import Branches from './branches'
import Permissions from './permissions'
import WorkRules from './work_rules'
import Users from './users'
import Employees from './employees'

const createStore = () => {
  return new Vuex.Store({
    state: {
      serverTime: null
    },

    mutations: {
      serverTime (state, payload) {
        state.serverTime = payload
      }
    },

    actions: {
      async serverTime ({ commit, state }, payload) {
        try {
          const res = await axios({method: "GET", url: "https://ts.tssys.tk/api/server_time"})
          commit('serverTime', res.data)
        } catch (e) {
          throw e
        }
      }
    },

    modules: {
      Branches,
      Permissions,
      WorkRules,
      Users,
      Employees
    }
  })
}

export default createStore