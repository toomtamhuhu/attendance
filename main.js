/*
**  Nuxt
*/
const http = require('http')
const { Nuxt, Builder } = require('nuxt')
let config = require('./nuxt.config.js')
config.rootDir = __dirname // for electron-builder
// Init Nuxt.js
const nuxt = new Nuxt(config)
const builder = new Builder(nuxt)
const server = http.createServer(nuxt.render)
// Build only in dev mode
if (config.dev) {
	builder.build().catch(err => {
		console.error(err) // eslint-disable-line no-console
		process.exit(1)
	})
}
// Listen the server
server.listen()
const _NUXT_URL_ = `http://localhost:${server.address().port}`
console.log(`Nuxt working on ${_NUXT_URL_}`)

/*
** Electron
*/
let win = null // Current window
const electron = require('electron')
const path = require('path')
const app = electron.app

const ZKFPScan = require('./zkfp-scan')

const newWin = () => {
	win = new electron.BrowserWindow({
		icon: path.join(__dirname, 'static/icon.png')
	})
	win.maximize()
	win.on('close', e => {
		var choice = electron.dialog.showMessageBox({
			type: 'question',
			buttons: ['ยืนยัน', 'ยกเลิก'],
			title: 'ออกจาก',
			message: 'ยืนยันการออกจากโปรแกรม'
		})
		if (choice == 1) e.preventDefault()
	})
	win.on('closed', () => win = null)
	if (config.dev) {
		// Install vue dev tool and open chrome dev tools
		const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer')
		installExtension(VUEJS_DEVTOOLS.id).then(name => {
			console.log(`Added Extension:  ${name}`)
			win.webContents.openDevTools()
		}).catch(err => console.log('An error occurred: ', err))
		// Wait for nuxt to build
		const pollServer = () => {
			http.get(_NUXT_URL_, (res) => {
				if (res.statusCode === 200) { win.loadURL(_NUXT_URL_) } else { setTimeout(pollServer, 300) }
			}).on('error', pollServer)
		}
		pollServer()
	} else { return win.loadURL(_NUXT_URL_) }
}
app.on('ready', newWin)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => win === null && newWin())

// custom code

const ipcMain = electron.ipcMain
const Menu = electron.Menu
const menuTemplate = require('./menu-template')

ipcMain.on('setMenu', (event, arg) => {
	const template = menuTemplate(arg)

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
})

ipcMain.on('startFingerScanner', (event, arg) => {
	ZKFPScan.connectDevice(win)
})

ipcMain.on('openFingerRegister', (event, arg) => {
	ZKFPScan.openFingerRegister(arg)
})

ipcMain.on('closeFingerRegister', () => {
	ZKFPScan.closeFingerRegister()
})

ipcMain.on('addFingerTemplate', (event, arg) => {
	event.returnValue = ZKFPScan.addFingerTemplate(arg)
})

ipcMain.on('initEmployeeFingerPrint', (event, arg) => {
	ZKFPScan.initEmployeeFingerPrint(arg)
})

const { exec } = require('child_process')
const printQueue = []
const clpath = !config.dev ? path.join(path.dirname(app.getPath('exe')), 'tools', 'CLPrint.exe') : path.join((app.getAppPath()), 'tools', 'CLPrint.exe')

ipcMain.on('print', (event, arg) => {
	printQueue.push(arg)
	if (printQueue.length === 1) printReport(printQueue[0]) // ปริ้นเมื่อเป็นรายการเดียวที่อยู่ในคิว
})

function printReport(arg) {
	messageToRender(`reportUrl: ${arg.url}`) //
	win.webContents.downloadURL(arg.url)

	win.webContents.session.once('will-download', (event, item, webContents) => {
		const filePath = path.join(app.getPath('temp'), `attendance${Date.now()}.pdf`)
		messageToRender(filePath) //
		item.setSavePath(filePath)

		return item.once('done', (event, state) => {
			if (state === 'completed') {
				if (arg.preview || false) {
					exec(filePath, (error, stdout, stderr) => {
						if (error) console.error(`exec error: ${error}`)
					})
				} else {
					const printCommand = `"${clpath}" /notcentered /scale:none /orientation:${arg.orientation || 'portrait'} /pdffile:"${filePath}" /print`
					messageToRender(printCommand)

					exec(printCommand, (error, stdout, stderr) => {
						if (error) {
							console.error(`exec error: ${error}`)
							messageToRender(`exec error: ${error}`)
						}
					})
				}
			} else {
				messageToRender(`Download failed: ${state}`)
			}

			printQueue.splice(0, 1) // ลบอันแรกออกจากคิว
			if (printQueue.length > 0) printReport(printQueue[0]) // ถ้าคิวยังไม่หมดทำต่อไป
			webContents.send('finish-print')
		})
	})
}

function messageToRender(data) {
	win.webContents.send('browserLog', data)
}
