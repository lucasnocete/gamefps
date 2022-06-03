<template>
    <Nuxt />
</template>

<script>
export default {
    data() {

        return {
        }
    },
    head() {
        return {
            title: 'Gang Shoot 2D Canvas Multiplayer Game',
            htmlAttrs: {
                lang: 'pt-BR'
            },
            link: [
                { rel: 'shortcut icon', type: 'image/x-icon', href: '/img/icon/favicon.png' },
                { rel: 'apple-touch-icon', type: 'image/x-icon', href: '/img/icon/favicon.png' },
            ],
            script: [
                { src: 'https://unpkg.com/colyseus.js@^0.14.0/dist/colyseus.js' },
            ]
        }
    }
};
</script>
