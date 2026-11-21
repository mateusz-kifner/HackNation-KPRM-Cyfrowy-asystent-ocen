import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import path from "node:path"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  nitro: {
    traceOpts: {
         nft: {
           base: path.resolve(process.cwd()),
         },
       },
  },
  preview: {
    allowedHosts: ["bluevoid.pl","bluevoid.smallhost.pl","0.0.0.0","127.0.0.1"]
  },
  test: {
    environment: 'node',
    globals: true,
  },
})

export default config
