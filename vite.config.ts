import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // build: {
  //   lib: {
  //     entry: resolve(__dirname, 'src/index.ts'), // エントリポイント
  //     name: 'solid-jsx-renderer', // グローバル変数として公開するライブラリの変数名
  //     fileName: 'solid-jsx-renderer', // 生成するファイルのファイル名を指定します。
  //     formats: ['es', 'umd'], // デフォルトのまま
  //   },
  //   rollupOptions: {
  //     external: ['solid-js'],
  //     output: {
  //       globals: {
  //         'solid-js': 'solid-js'
  //       }
  //     }
  //   }
  // },
  plugins: [
    solidPlugin()
  ],
  optimizeDeps: {
    exclude: ['solid-jsx-renderer']
  }
})