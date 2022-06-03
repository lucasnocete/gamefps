module.exports = {
    apps: [
        {
            name: 'pptgo.com.br',
            exec_mode: 'cluster',
            instances: 'max',
            script: './node_modules/nuxt/bin/nuxt.js',
            args: 'start'
        }
    ]
}
