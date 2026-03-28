import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable terser for better compatibility or debugging
    // It's known to sometimes cause "Identifier has already been declared" errors, especially with mixing CommonJS/ESM
    minify: "esbuild", // Default esbuild is much safer than terser, or use `false` to disable entirely. Let's use false for a foolproof fix if n$ error still happens, but esbuild handles it well. 
    // Actually, setting it to false exactly as requested by the user: "Temporarily disable minification if needed to debug" is a good option.
    // I will use esbuild but disable sourcemaps which might be causing memory or reference issues, and adjust chunks.
    sourcemap: false,
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "framer-motion", "sonner", "tailwind-merge"],
          video: ["video.js", "hls.js"]
        },
      },
    },
  },
}));
