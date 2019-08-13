<template>
	<div>
		<v-app>
			<v-content class="blue lighten-4">
				<v-container grid-list-md>
					<nuxt/>
				</v-container>
			</v-content>
		</v-app>
		<no-ssr>
			<v-notice />
		</no-ssr>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { remote, ipcRenderer } from 'electron'

export default {
  middleware: ['auth', 'prepareData', 'serverTime'],

	head () {
		return {
			title: `โปรแกรมลงเวลา เวอร์ชั่น${this.version} - ผู้ใช่: ${this.$auth.user.name}`
		}
	},

	data () {
  	return {
			version: remote.app.getVersion(),
		}
	},

  watch: {
  	'$route'(data) {
	  	console.log(data)
	  }
  },

	computed: {
		...mapGetters({
			can: 'Permissions/can',
			activeBranch: 'Branches/active'
		})
	},

  created() {
		ipcRenderer.send('setMenu', [
			{label: 'Home', link: '/'},
			{label: 'ลงเวลา', link: '/attendances'},
			{label: 'เพิ่มนิ้ว พนง.', link: '/finger-print', permission: this.hasRole('HR') || this.hasRole('ADMIN')},
			{
				label: 'ตั้งค่า',
				permission: this.hasRole('HR') || this.hasRole('ADMIN'),
				submenu: [
					// { label: 'ผู้ใช้', link: '/settings/users' },
					{ label: 'ข่าวสาร', link: '/settings/news', permission: this.hasRole('HR') || this.hasRole('ADMIN') },
					{ label: 'กะการทำงาน', link: '/settings/work-rules', permission: this.hasRole('ADMIN') }
				]
			}
		])

		ipcRenderer.on('toPage', (event, arg) => {
			this.$router.push(arg)
		})

	  ipcRenderer.on('logout', async (event, arg) => {
	  	ipcRenderer.send('setMenu', [])
		  this.$router.push('login')
			this.$store.commit('Permissions/data', null)
			this.$store.commit('Branches/data', null)
		  await this.$auth.logout()
	  })

	  ipcRenderer.on('browserLog', (event, arg) => {
	  	console.log(arg)
	  })
  }
}
</script>