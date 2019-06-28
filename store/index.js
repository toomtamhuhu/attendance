import Vuex from 'vuex'

import Branches from './branches'
import Permissions from './permissions'
import WorkRules from './work_rules'
import Users from './users'
import Employees from './employees'

const createStore = () => {
  return new Vuex.Store({
    actions: {},

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