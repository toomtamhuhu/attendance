import Vue from 'vue'
import { ipcRenderer } from 'electron'

Vue.prototype.$printReport = options => {
  options.url = `http://hr.tsgoldprices.tk/storage/upload/pdf/${options.file_name}`

  ipcRenderer.send('print', options)

  return new Promise((resolve, reject) =>
    ipcRenderer.on('finish-print', () => {
      resolve()
    })
  )
}
