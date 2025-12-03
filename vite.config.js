/*
    ~ vite.config.js
    Dev-server configuration file
    @author jhotiori
*/

import { defineConfig } from "vite";
import htmlMinifier from "vite-plugin-html-minifier";
import lightningcss from "vite-plugin-lightningcss";

export default defineConfig({
	base: "./",
	root: "src",
	publicDir: "src/public",
	appType: "spa",

	plugins: [
		lightningcss({
			browserslist: ">= 0.25%, last 2 versions, not dead",
			minify: true,
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

	preview: {
		port: 8001,
		open: false,
		cors: true,
		strictPort: true,
	},

	esbuild: {
		target: "esnext",
	},

	build: {
		target: "esnext",
		minify: "esbuild",
		cssMinify: "lightningcss",

		outDir: "../build",
		emptyOutDir: true,

		reportCompressedSize: false,
		cssCodeSplit: false,
		sourcemap: false,
		assetsInlineLimit: 0,

		modulePreload: {
			polyfill: false,
		},

		rollupOptions: {
			preserveEntrySignatures: "strict",
			output: {
				inlineDynamicImports: true,
				manualChunks: undefined,
				entryFileNames: `[name].js`,
				chunkFileNames: `[name].js`,
				assetFileNames: "assets/[name][extname]",
			},
		},
	},

	optimizeDeps: {
		include: [...Object.keys(require("./package.json").dependencies)],
		esbuildOptions: { target: "esnext" },
		force: true,
	},
});
