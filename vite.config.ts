import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo (desenvolvimento/produção)
  // O terceiro argumento '' permite carregar todas as variáveis, não apenas as que começam com VITE_
  // Fix: Use '.' as path instead of process.cwd() to avoid TS error when Node types are missing
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Isso injeta a chave API no código durante o build de forma que 'process.env.API_KEY' funcione no navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      // Configurações para garantir compatibilidade com o build de produção
      target: 'esnext',
    }
  }
})