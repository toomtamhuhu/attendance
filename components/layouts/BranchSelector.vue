<template>
  <v-select
      :items="items"
      label="Standard"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  async fetch ({ store }) {
    store.dispatch('Branches/fetch')
  },

  props: {
    value: {
      type: [Object, Number],
      default () {
        return null
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    nullable: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    selectedBranch: null
  }),

  watch: {
    selectedBranch (data) {
      if (data || this.nullable) this.$emit('input', data)
    }
  },

  computed: {
    ...mapGetters({
      branches: 'Branches/data'
    })
  },

  async mounted () {
    this.$nextTick(() => {
      if (typeof this.value === 'number') {
        this.selectedBranch = _.find(this.branches, {'id': this.value})
      } else if (this.value && typeof this.value !== 'undefined') {
        this.selectedBranch = _.find(this.branches, {'id': this.value.id})
      } else {
        this.selectedBranch = _.find(this.branches, {'id': this.$store.getters['Branches/branch'](this.$auth.user.branch_id).main_branch_id})
      }
    })
  }
}
</script>