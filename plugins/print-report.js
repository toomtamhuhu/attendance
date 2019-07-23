import Vue from 'vue'
import { ipcRenderer } from 'electron'

Vue.prototype.$printReport = options => {
  options.url = process.env.reportUrl + options.file_name
  ipcRenderer.send('print', options)

  return new Promise((resolve, reject) =>
    ipcRenderer.on('finish-print', () => {
      resolve()
    })
  )
}
