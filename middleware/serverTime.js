export default function ({ store, app, redirect }) {
  if (store.state.serverTime && app.moment(store.state.serverTime).format('YYYY-MM-DD') !== app.moment().format('YYYY-MM-DD'))
    return redirect('/errors/server-time-error')
}
