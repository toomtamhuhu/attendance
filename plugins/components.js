import Vue from 'vue'
import Notifications from 'vue-notification'
import Notice from '@/components/shared/Notification'
import Page from '@/components/layouts/Page'
import Table from '@/components/layouts/Table'
import CreateOrEditButtonComponent from '@/components/layouts/CreateOrEditButtonComponent'

Vue.use(Notifications)

Vue.component('v-notice', Notice)
Vue.component('v-page', Page)
Vue.component('v-table', Table)
Vue.component('v-create-update-button', CreateOrEditButtonComponent)
