export default async function ({ store, app }) {
  if (store.state.Permissions.data === null && store.state.auth.user.roles.length > 0) store.commit('Permissions/data', app.$auth.user.roles[0].permissions)

  if (store.state.Branches.data === null || store.state.Branches.data.length <= 0) {
    await store.dispatch('Branches/fetch')
    const userBranch = store.getters['Branches/branch'](store.state.auth.user.branch_id)
    store.commit('Branches/active', userBranch)
  }
}