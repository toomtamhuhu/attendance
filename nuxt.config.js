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
    }
  },
  dev: process.env.NODE_ENV === 'DEV',
  css: [
    '@/assets/css/global.css'
  ],
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/vuetify'
  ],
  auth: {
    redirect: {
      login: '/login',
    },
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '/oauth/token',
            propertyName: 'access_token'
          },
          logout: false,
          user: {
            url: '/api/user',
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
