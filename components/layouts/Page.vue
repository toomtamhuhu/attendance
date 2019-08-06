<template>
  <div>
    <v-layout>
      <v-flex>
        <v-card white>
          <v-container v-if="$slots['content']">
            <slot name="content"/>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout v-if="$slots['footer']">
      <v-flex>
        <v-card white>
          <v-container>
            <slot name="footer" />
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>
