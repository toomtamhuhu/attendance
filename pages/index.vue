<template>
	<v-app>
		<v-content>
			<v-container>Hello word</v-container>
		</v-content>
	</v-app>
</template>

<script>
export default {
	data() {
		return {
			users: []
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
}
.btn {
	margin: 0 8px;
}
</style>
