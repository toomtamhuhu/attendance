import { ipcRenderer } from 'electron'

export default async function ({ store, app }) {
  if (store.state.Employees.data === null || store.state.Employees.data.length <= 0) store.dispatch('Employees/fetch').then(() => {
    ipcRenderer.send('initEmployeeFingerPrint', store.getters['Employees/data'])
  })

  if (store.state.Permissions.data === null && store.state.auth.user.roles.length > 0) store.commit('Permissions/data', app.$auth.user.roles[0].permissions)

  if (store.state.serverTime === null) store.dispatch('serverTime')

  if (store.state.Branches.data === null || store.state.Branches.data.length <= 0) {
    await store.dispatch('Branches/fetch')
    const userBranch = store.getters['Branches/branch'](store.state.auth.user.branch_id)
    store.commit('Branches/active', userBranch)
  }

  if (store.state.News.data === null || store.state.News.data.length <= 0) {
    await store.dispatch('News/fetch')
  }
}