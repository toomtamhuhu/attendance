import Vue from 'vue'
import { ipcRenderer } from 'electron'

Vue.prototype.$printReport = options => {
  if (!process.env.reportUrl) return

  options.url = `${process.env.reportUrl}${options.file_name}`

  ipcRenderer.send('print', options)

  return new Promise((resolve, reject) =>
    ipcRenderer.on('finish-print', () => {
      resolve()
    })
  )
}
