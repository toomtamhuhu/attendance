var zkfp = null
try {
  zkfp = require('./c_addons/zkfp/build/Release/zkfp')
} catch (e) {
  console.log(e)
}

var init = null
var employee = null
var win = null
var m_register = false
var m_imgFPWidth = 0
var m_imgFPHeight = 0
var template = null
var m_enrollIdx = 0
var m_arrPreTempsLen = Array(3).fill(0)
var m_arrPreRegTemps = new Array(3);
for (var i = 0; i < m_arrPreRegTemps.length; i++) m_arrPreRegTemps[i] = Array(2048).fill(0);

const connectDevice = (h) => {
  if (zkfp === null || init === 0) return

  win = h
  init = zkfp.zkfpm_init()

  if (0 != init) {
    console.log('Init ZKFPM fail')
    messageToRender('Init ZKFPM fail')
    return
  }
  console.log('Init ZKFPM pass')

  if (0 == zkfp.zkfpm_open_device(0)) {
    console.log('Open sensor fail')
    messageToRender('Open sensor fail')
    return
  }
  console.log('Open sensor pass')

  if (0 == zkfp.zkfpm_db_init()) {
    console.log('Create DBCache fail')
    messageToRender('Create DBCache fail')
    return
  }
  console.log('Create DBCache pass')

  let getWidth = zkfp.zkfpm_get_parameters(1, m_imgFPWidth, 4)
  m_imgFPWidth = getWidth.value
  let getHeight = zkfp.zkfpm_get_parameters(2, m_imgFPHeight, 4)
  m_imgFPHeight = getHeight.value
  // var m_img = Buffer.alloc(m_imgFPWidth * m_imgFPHeight)
  beep(100)
  threadCapture()
}

function terminate () {
  zkfp.zkfpm_terminate()
  init = null
}

function threadCapture () {
  let ret = zkfp.zkfpm_acquire_fingerprint(m_imgFPWidth*m_imgFPHeight, 2048)
  if (0 == (ret.status)) {
    beep(100)

    template = Buffer.from(ret.template)
    zkfp.zkfpm_get_parameters(2004, 0, 4);
    if (m_register) {
      DoRegister(template);
    } else {
      DoIdentify(template)
    }
  }
  
  setTimeout(threadCapture, 300)
}

function DoRegister (template) {
  if (m_enrollIdx >= 3) {
    m_enrollIdx = 0;	//restart enroll
    return;
  }
  if (m_enrollIdx > 0) {
    let v = zkfp.zkfpm_db_match(m_arrPreRegTemps[m_enrollIdx-1], m_arrPreTempsLen[m_enrollIdx-1], template, 2048)
    if (0 >= v.status) {
      m_enrollIdx = 0;
      fingerPrintToRender({
        process: 'register',
        status: false,
        notice: 'กรุณาใช้นิ้วเดียวกัน!'
      })
      console.log('error')
    }
  }
  m_arrPreTempsLen[m_enrollIdx] = 2048
  m_arrPreRegTemps[m_enrollIdx] = template;

  if (++m_enrollIdx >= 3) {
    let ret = 0
    ret = zkfp.zkfpm_db_merge(m_arrPreRegTemps[0], m_arrPreRegTemps[1], m_arrPreRegTemps[2], 2048)
    m_enrollIdx = 0;
    m_register = false;
    template = Buffer.from(ret.template)
    if (0 == ret.status) {
      let base64data = template.toString('base64')
      fingerPrintToRender({
        base64: base64data,
        enroll_idx: 0,
        process: 'register',
        status: true,
        notice: 'อ่านลายนิ้วมือสำเร็จ'
      })
    } else {
      console.log('register fail')
      fingerPrintToRender({
        process: 'register',
        status: false,
        notice: 'ล้มเหลว!'
      })
    }
  } else {
    fingerPrintToRender({
      process: 'register',
      enroll_idx: 3 - m_enrollIdx
    })
    console.log(`You still need press ${3 - m_enrollIdx} times finger`)
  }
}

function DoIdentify (template) {
  var ret = zkfp.zkfpm_db_identify(template, 2048);
  fingerPrintToRender({
    ret,
    employee_id: ret.status === 0 ? Number(ret.id.toString().substr(1)) : null,
    process: 'identify',
    status: true,
    notice: 'Identify succ!'
  })
}

function openFingerRegister (data) {
  employee = data
  employee.id = Number(`${employee.finger}${employee.id}`)
  m_register = true
  m_enrollIdx = 0
}

function closeFingerRegister () {
  m_register = false
  employee = null
  m_enrollIdx = 0
}

function addFingerTemplate (data) {
  let employeeId = Number(`${data.finger}${data.id}`)
  try {
    zkfp.zkfpm_db_del(employeeId);
  } catch (e) {
    console.log(e)
  }

  try {
    console.log('zkfpm_db_add')
    let buff = new Buffer(data.template, 'base64');

    let ret = zkfp.zkfpm_db_add(employeeId, buff, 2048)
    if (0 == ret.status) {
      console.log("add succ")
      return {
        process: 'add',
        status: true,
        notice: 'บันทึกลายนิ้วมือสำเร็จ'
      }
    } else {
      console.log('fail to add finger print')
      return {
        process: 'add',
        status: false,
        notice: 'บันทึกลายนิ้วมือล้มเหลว',
        data: {
          response: ret,
          employeeId
        }
      }
    }
  } catch (e) {
    return {
      process: 'add',
      status: false,
      notice: e
    }
  }
}

function deleteFingerTemplate(employee) {
  let finger_1 = Number(`1${employee.id}`)
  let finger_2 = Number(`2${employee.id}`)

  try {
    zkfp.zkfpm_db_del(finger_1);
    zkfp.zkfpm_db_del(finger_2);
  } catch (e) {
    return {
      process: 'delete',
      status: false,
      notice: e
    }
  }

  return {
    process: 'delete',
    status: true,
    notice: 'ลบลายนิ้วมือสำเร็จ'
  }
}

function initEmployeeFingerPrint (employees) {
  if (zkfp === null) return

  employees.forEach((v, k) => {
    if (v.finger_print1) {
      let buff = new Buffer(v.finger_print1, 'base64');
      zkfp.zkfpm_db_add(Number(`1${v.id}`), buff, 2048)
    }
    if (v.finger_print2) {
      let buff = new Buffer(v.finger_print2, 'base64');
      zkfp.zkfpm_db_add(Number(`2${v.id}`), buff, 2048)
    }
  })
}

function fingerPrintToRender(data) {
  win.webContents.send('getFingerPrintDetail', data)
}

function messageToRender(data) {
  win.webContents.send('browserLog', data)
}

function beep(duration) {
  return new Promise((resolve, reject) => {
    zkfp.zkfpm_set_parameters(104, 1, 4)
    setTimeout(() => {
      zkfp.zkfpm_set_parameters(104, 0, 4)
      resolve()
    }, duration)
  })
}

module.exports = {
  connectDevice,
  terminate,
  openFingerRegister,
  closeFingerRegister,
  initEmployeeFingerPrint,
  addFingerTemplate,
  deleteFingerTemplate
}
