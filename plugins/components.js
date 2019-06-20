import Vue from 'vue'
import Notifications from 'vue-notification'
import Notice from '@/components/shared/Notification'
import Page from '@/components/layouts/Page'
import VueApollo from 'vue-apollo'
import Table from '@/components/layouts/Table'

Vue.use(Notifications)
Vue.use(VueApollo)

Vue.component('v-notice', Notice)
Vue.component('v-page', Page)
Vue.component('v-table', Table)
