import Vue from 'vue'
import { ipcRenderer } from 'electron'

Vue.prototype.$printReport = options => {
  if (!process.env.reportUrl) return
  options.file_name = `${options.report_type}${Date.now()}.pdf`
  ipcRenderer.send('print', options)

  return new Promise((resolve, reject) =>
    ipcRenderer.on('finish-print', () => {
      resolve()
    })
  )
}
