import { defineConfig } from 'vite'
// import svgr from "vite-plugin-svgr";
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy alla förfrågningar som börjar med '/api' till din Go-backend
      '/api': {
        target: 'http://localhost:8081', // GO-backend adress
        changeOrigin: true, // Ändrar 'Origin' headern till target URL:en. Viktigt för att undvika CORS-problem.
      },
    },
  },
});