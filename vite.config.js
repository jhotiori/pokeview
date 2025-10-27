/*
    Vite dev-server configuration for local development
    @author jhotiori
*/

import { defineConfig } from "vite";
import lightningcss from "vite-plugin-lightningcss";

export default defineConfig({
    server: {
        port: 8080,
        open: false
    },

    plugins: [
        lightningcss({
            minify: true,
            analyzeDependencies: true,
            browserslist: [
                '> 0.25%',
                'last 2 versions',
                'not dead',
                'not IE <= 11',
                'not op_mini all'
            ],

            drafts: {
                nesting: true,
                customMedia: true
            },

            cssModules: {
                pattern: '[name]_[hash:base64:6]'
            }
        })
    ],

    root: "src"
})
