<template>
	<div>
		<v-app>
			<v-content>
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
import { ipcRenderer } from 'electron'

export default {
  middleware: ['auth', 'prepareData'],

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
			{label: 'ตั้งค่ากะงาน', link: '/work-rules'},
			{
				label: 'ตั้งค่า',
				permission: this.can('settings'),
				submenu: [
					{ label: 'ผู้ใช้', link: '/settings/users' },
					{ label: 'กะการทำงาน', link: '/settings/work-rules' }
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