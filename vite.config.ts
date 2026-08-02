import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Куда dev-сервер незаметно проксирует /api. Эта переменная живёт только
  // в конфиге сборки и НЕ попадает в клиентский бандл — адрес бэка скрыт.
  const proxyTarget = env.VITE_PROXY_TARGET ?? 'http://localhost:4000';

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Всё, что идёт на /api, форвардим на бэкенд. Для браузера это
        // same-origin: он не видит реального адреса сервера.
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
