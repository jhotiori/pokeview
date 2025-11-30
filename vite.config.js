/*
    ~ vite.config.js
    Dev-server configuration file
    @author jhotiori
*/

import { defineConfig } from "vite";
import htmlMinifier from "vite-plugin-html-minifier";
import lightningcss from "vite-plugin-lightningcss";

export default defineConfig({
	root: "src",
	publicDir: "src/public",
	appType: "spa",

	plugins: [
		lightningcss({
			browserslist: ">= 0.25%, last 2 versions, not dead",
			drafts: {
				customMedia: true,
				nesting: true,
			},
		}),

		htmlMinifier({
			minify: true,
		}),
	],

	server: {
		port: 8000,
		open: false,
		cors: true,
		strictPort: true,
		hmr: {
			protocol: "ws",
			overlay: true,
		},
	},

	esbuild: {
		target: "esnext",
		minify: true,
	},

	build: {
		target: "esnext",
		minify: "esbuild",
		cssMinify: "lightningcss",

		outDir: "../build",
		emptyOutDir: true,

		modulePreload: {
			polyfill: false,
		},

		rollupOptions: {
			output: {
				inlineDynamicImports: true,
				manualChunks: undefined,
			},
		},

		reportCompressedSize: false,
		cssCodeSplit: false,
		sourcemap: false,
		assetsInlineLimit: 0,
	},

	optimizeDeps: {
		entries: ["./src/**/*.js"],
		esbuildOptions: { target: "esnext" },
		force: true,
	},
});
