import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules配下のライブラリを分離
          if (id.includes('node_modules')) {
            // React関連
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            // Radix UI
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // アイコン
            if (id.includes('lucide-react') || id.includes('@radix-ui/react-icons')) {
              return 'icons';
            }
            // wouter
            if (id.includes('wouter')) {
              return 'router';
            }
            // その他のライブラリ
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
