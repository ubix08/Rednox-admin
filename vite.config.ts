import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    vue(),
    monacoEditorPlugin({
      // Optional: Customize if needed (e.g., include only specific languages)
      languageWorkers: ['editorWorkerService', 'json', 'javascript', 'typescript']
    })
  ],
  base: '/', // For Cloudflare Pages root deployment
});
