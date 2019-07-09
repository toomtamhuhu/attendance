import Vue from 'vue'
import moment from 'moment'
import numeral from 'numeral'

Vue.filter('moment', (date, format) => {
  return format ? moment(date).locale('th').format(format) : moment(date).locale('th').format('YYYY-MM-DD')
})

Vue.filter('numeral', (value, format, hideZero) => {
  const data = format ? numeral(value).format(format) : numeral(value).format('0,0.[00]')
  return hideZero && Number(data) === 0 ? '' : data
})

Vue.directive('focusNext', {
  bind(el, binding, vnode) {
    el.addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        event.preventDefault()
        const next = findFieldElement(event.target)
        try {
          next.select()
        } catch (e) {
          next.focus()
        }
      }
    })
  }
})

function findFieldElement(base, el) {
  if (typeof el === 'undefined') el = base
  if (base === el) { // to prevent going back to same element
    if (el.nextElementSibling) return findFieldElement(base, el.nextElementSibling)
    else return el.parentElement.nextElementSibling
      ? findFieldElement(base, el.parentElement.nextElementSibling)
      : findFieldElement(el.parentElement, el.parentElement) // prevent parent to go down to the same child
  } else {
    if ((el.nodeName === 'INPUT' || el.nodeName === 'BUTTON') && !el.disabled) return el
    else if (el.children.length > 0) return findFieldElement(base, el.firstElementChild)
    else if (el.nextElementSibling) return findFieldElement(base, el.nextElementSibling)
    else return el.parentElement.nextElementSibling
      ? findFieldElement(base, el.parentElement.nextElementSibling)
      : findFieldElement(el.parentElement, el.parentElement)
  }
}

Vue.prototype.$moment = moment
Vue.prototype.$numeral = numeral

Vue.mixin({
  methods: {
    noticeAlert(inputs) {
      this.$notify({
        group: 'notify',
        type: inputs.status ? 'is-success' : 'is-danger',
        title: inputs.notice
      })
    },
    errorAlert(error) {
      if (error.response) {
        if (error.response.status === 413) {
          this.$notify({
            group: 'notify',
            type: 'is-danger',
            title: 'ทรัพยากรที่ร้องขอใหญ่เกินกว่าที่จะส่งด้วยโพรโทคอลปัจจุบันได้'
          })
        } else {
          this.$notify({
            group: 'notify',
            type: 'is-danger',
            title: this.errorMsg(error)
          })
        }
      } else if (error.request) {
        console.log(error.message)
        console.log(error.request)
      } else if (error.message) {
        this.$notify({
          group: 'notify',
          type: 'is-danger',
          title: error.message
        })
      } else {
        this.$notify({
          group: 'notify',
          type: 'is-danger',
          title: error
        })
      }
    },
    errorMsg(e) {
      if (typeof e.response.data.errors !== 'undefined') {
        let validate = e.response.data.errors
        let errors = ''
        for (const prop in validate) {
          errors += `${validate[prop]}<br>`
        }
        return errors
      }
      return e.response.data.message
    },

    userCan (permission) {
      if (typeof this.$auth.user.roles[0] === 'undefined') return false
      const allow = _.find(this.$auth.user.roles[0].permissions, { 'name': permission })
      if (typeof allow === 'undefined') return false
      return true
    }
  }
})
