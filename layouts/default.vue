<template>
	<div>
		<v-app>
			<v-content>
				<v-container>
					<nuxt/>
				</v-container>
			</v-content>
		</v-app>
	</div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  middleware: ['auth'],

  watch: {
  	'$route'(data) {
	  	console.log(data)
	  }
  },

  created() {
		ipcRenderer.send('setMenu', [
			{label: 'Home', link: '/'},
			{label: 'ตั้งค่ากะงาน', link: '/setting-work'},
		])

		ipcRenderer.on('toPage', (event, arg) => {
			this.$router.push(arg)
		})

	  ipcRenderer.on('logout', async (event, arg) => {
	  	ipcRenderer.send('setMenu', [])
		  this.$router.push('login')
		  await this.$auth.logout()
	  })

	  ipcRenderer.on('browserLog', (event, arg) => {
	  	console.log(arg)
	  })
  }
}
</script>