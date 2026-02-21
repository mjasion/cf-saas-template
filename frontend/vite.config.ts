import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  server: {
    proxy: {
      '/a/': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['node:stream', 'node:stream/web', 'node:async_hooks'],
    },
  },
  ssr: {
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@tanstack/react-router',
        '@tanstack/react-start',
        '@radix-ui/react-slot',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-label',
        '@radix-ui/react-tooltip',
        'sonner',
        'lucide-react',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'framer-motion',
      ],
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
