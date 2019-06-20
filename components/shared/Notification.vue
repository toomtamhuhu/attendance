<template>
  <div>
    <notifications
        :duration="5000"
        :width="320"
        group="notify"
        position="top center"
        classes="notification"
    />
  </div>
</template>

<style lang="scss">
  .notifications {
    margin-top: 25px;
  }

  .notification-wrapper {
    margin: 10px 0;
  }

  .notification {
    margin-top: 5px;
    opacity: 0.9;
    margin: auto;
  }

  @media screen and (max-width: 410px) {
    .notification {
      width: 280px !important;
    }
  }
</style>
