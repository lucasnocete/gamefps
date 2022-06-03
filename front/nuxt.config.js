export default {
    target: 'static',
    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
    ],
    // Auto import components: https://go.nuxtjs.dev/config-components
    components: [
    ],

    serverMiddleware: [
    ],

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
    ],
    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
    ],

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
    },

    lazySizes: {
        /* module options */
    },

    publicRuntimeConfig: {
        ws: process.env.NODE_ENV === 'production' ? 'wss://wss.domain.com' : 'ws://localhost:2567',
    },

    privateRuntimeConfig: {
        ws: process.env.NODE_ENV === 'production' ? 'wss://wss.domain.com' : 'ws://localhost:2567',
    },
}
