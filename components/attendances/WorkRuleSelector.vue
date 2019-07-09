<template>
  <v-select
      v-model="selectedWorkRule"
      :items="work_rules"
      item-text="full_name"
      :return-object="true"
      :disabled="disabled"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    value: {
      type: [Object, Number],
      default() {
        return null
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    selectedWorkRule: null,
    loading: true
  }),

  watch: {
    selectedWorkRule(data) {
      if (data) this.$emit('input', data)
    }
  },

  computed: {
    ...mapGetters({
      work_rules: 'WorkRules/data'
    })
  },

  async mounted() {
    this.$nextTick(() => {
      if (typeof this.value === 'number') {
        this.selectedWorkRule = _.find(this.work_rules, {'id': this.value})
      } else if (this.value && typeof this.value !== 'undefined') {
        this.selectedWorkRule = _.find(this.work_rules, {'id': this.value.id})
      } else {
        this.selectedWorkRule = this.work_rules[0]
      }
    })
  }
}
</script>