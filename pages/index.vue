<template>
	<v-app>
		<v-container v-if="latestNews">
			<v-layout align-start row fill-height>
				<span v-html="latestNews.description"></span>
			</v-layout>
		</v-container>
	</v-app>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	computed: {
		...mapGetters({
			news: 'News/data'
		}),
		latestNews() {
			return _.last(this.news)
		}
	}
}
</script>
