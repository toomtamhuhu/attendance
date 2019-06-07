export default function ({redirect, app}) {
  if (app.$auth.loggedIn) {
    return redirect('/home')
  }
}