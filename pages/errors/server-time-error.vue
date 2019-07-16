<template>
  <div>
    <v-alert
        :value="true"
        color="error"
        icon="warning"
        outline
    >
      เวลาไม่ถูกต้อง
    </v-alert>
  </div>
</template>

<script>
export default {
  layout: 'error-template'
}
</script>