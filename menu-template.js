const _ = require('lodash')

const menuItem = (label, link, params) => {
  if (params) link = `${link}?` + _.reduce(params, (pre, cur, key) => {
    return pre + `${key}=${cur}&`
  }, '')
  return {
    label,
    click (item, focusedWindow) {
      focusedWindow.webContents.send('toPage', link)
    }
  }
}

const menuGenerator = (menus) => {
  return _.reduce(menus, (pre, cur) => {
    if (typeof cur.permission !== 'undefined' && !cur.permission) return pre

    if (typeof cur.submenu !== 'undefined') {
      pre.push({
        label: cur.label,
        submenu: menuGenerator(cur.submenu)
      })
    } else {
      pre.push(menuItem(cur.label, cur.link, cur.params))
    }
    return pre
  }, [])
}

const template = (menus) => {
  const menu = menuGenerator(menus)

  // if (process.env.NODE_ENV === 'DEV')
  menu.push({
    label: 'dev',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'}
    ]
  })

  menu.push({
    label: 'จบการทำงาน',
    submenu: [
      { label: 'เปลี่ยนผู้ใช้งาน', click: (item, focusedWindow) => focusedWindow.webContents.send('logout') },
      { label: 'ออกโปรแกรม', role: 'close' },
    ]
  })

  return menu
}

module.exports = template