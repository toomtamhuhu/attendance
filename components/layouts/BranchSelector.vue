<template>
  <v-select
      v-model="selectedBranch"
      :items="branches"
      item-text="name"
      :return-object="true"
      :disabled="disabled"
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
    selectedBranch: null,
    loading: true
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
        // console.log(this.branches, this.$store.getters['Branches/branch'](this.$auth.user.branch_id))
        this.selectedBranch = this.userCan('branch_selectable') ? this.branches[0] : _.find(this.branches, {'id': this.$store.getters['Branches/branch'](this.$auth.user.branch_id)})
      }
    })
  }
}
</script>