import { dotEnvOption } from './config/env';
import vuetifyModuleConfig from './config/nuxt/vuetify-module';

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - start-vue',
    title: 'start-vue',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  server: {
    host: '0.0.0.0',
  },
  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  // Nuxt.js에서는 filter 도 plugins 속성으로 정의되어, plugins 하위에 filters 폴더로 설정함
  plugins: ['~/plugins/filters', '~/plugins/context'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  // Auto import 시 모든 컴포넌트를 미리 로딩하여 데이터가 낭비되며 속도가 저하된다.
  components: false,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',

    ['@nuxtjs/dotenv', dotEnvOption],

    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
  ],
  env: {
    // .env 설정 파일에 있는 URL값 가져와서 세팅
    AXIOS_BASE_URL: process.env.AXIOS_BASE_URL, //front 도메인 주소
    API_DEV: process.env.API_DEV, // backend 도메인 주소
  },
  axios: {
    proxy: true,
    baseURL: process.env.AXIOS_BASE_URL,
    proxyHeaders: false,
    credentials: false,
  },
  // axios 에는 프론트 도메인 주소 설정
  proxy: {
    '/api/': {
      target: process.env.API_DEV,
      pathRewrite: { '/api/': '' }, //패스 스위칭
      changeOrigin: true, // cors
    },
  },
  // proxy 에는 백엔드 도메인 주소 설정

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: vuetifyModuleConfig,

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
};
