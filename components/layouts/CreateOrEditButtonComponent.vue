<template>
  <div>
    <v-layout justify-end>
      <v-btn
          class="mx-0"
          :color="color"
          :outline="outline"
          dark
          @click.stop="open = true"
      >
        {{ text }}
      </v-btn>
    </v-layout>
    <v-divider class="my-3"></v-divider>

    <v-dialog
        v-model="open"
        width="500"
    >
      <div v-if="$slots['content']">
        <slot name="content" />
      </div>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    props: {
      dialog: {
        type: Boolean,
        default: false
      },
      color: {
        type: String,
        default: 'primary'
      },
      outline: {
        type: Boolean,
        default: true
      },
      text: {
        type: String,
        default: 'เพิ่ม'
      }
    },
    watch: {
      test (data) {
        console.log(data, 'ok')
      }
    },
    data() {
      return {
        open: false
      }
    }
  }
</script>