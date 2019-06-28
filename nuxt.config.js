require('dotenv').config()

module.exports = {
  mode: 'spa',
  head: { title: 'attendance' }, // Headers of the page
  loading: false, // Disable default loading bar
  build: {
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        // Run ESLint on save
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      // Extend only webpack config for client-bundle
      if (isClient) { config.target = 'electron-renderer' }
    },
    vendor: [
      'lodash',
      'moment',
      'numeral'
    ],
  },
  dev: process.env.NODE_ENV === 'DEV',
  env: {
    clientSecret: process.env.clientSecret || '',
    baseUrl:  process.env.baseUrl || 'http://localhost'
  },
  css: [
    '@/assets/css/global.css'
  ],
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/vuetify'
  ],
  plugins: [
    { src: '~/plugins/index' },
    { src: '~/plugins/components', ssr: false }
  ],
  auth: {
    redirect: {
      login: '/login',
    },
    strategies: {
      local: {
        endpoints: {
          login: {
            method: 'post',
            url: '/oauth/token',
            propertyName: 'access_token'
          },
          logout: false,
          user: {
            url: 'v2/api/user',
            propertyName: false
          }
        }
      }
    }
  },
  axios: {
    baseURL: process.env.baseUrl || 'http://localhost',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }
}
