import Vue from 'vue'
import { ipcRenderer } from 'electron'

Vue.prototype.$printReport = options => {
  if (!process.env.reportUrl) return

  ipcRenderer.send('print', options.url)

  return new Promise((resolve, reject) =>
    ipcRenderer.on('finish-print', () => {
      resolve()
    })
  )
}

Vue.prototype.$printPdf = url => {
  const options = { url, preview: true }
  ipcRenderer.send('print', options)

  return new Promise((resolve, reject) =>
    ipcRenderer.on('finish-print', () => {
      resolve()
    })
  )
}
