import { vlyPlugin } from "@vly-ai/integrations";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vlyPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force a single copy of React across all packages (including vlyPlugin).
    // Without this, @vly-ai/integrations can resolve its own React copy, which
    // triggers "Invalid hook call" errors at runtime.
    dedupe: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  build: {
    // Enable source maps for better debugging (disable in production if needed)
    sourcemap: false,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching AND lower peak build memory
        // (each package gets its own chunk so no single JS file blows up minify/RSS).
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          const pkgPath = id.split("node_modules/")[1] ?? "";
          const pkgName = pkgPath.startsWith("@")
            ? pkgPath.split("/").slice(0, 2).join("/")
            : pkgPath.split("/")[0];
          if (pkgName.startsWith("@radix-ui/")) return "radix-ui";
          if (pkgName.startsWith("@convex-dev/")) return "convex-vendor";
          if (pkgName.startsWith("react-router")) return "react-vendor";
          if (["react", "react-dom"].includes(pkgName)) return "react-vendor";
          if (["react-hook-form", "zod"].includes(pkgName) || pkgName === "@hookform") return "forms";
          if (pkgName === "recharts" || pkgName === "d3" || pkgName.startsWith("d3-")) return "charts";
          if (pkgName === "framer-motion") return "framer-motion";
          if (pkgName.startsWith("date-fns")) return "dates";
          if (pkgName === "lucide-react") return "lucide";
          if (pkgName === "convex") return "convex-vendor";
          return pkgName.replace(/[^a-zA-Z0-9_-]/g, "_") || undefined;
        },
        // Optimize chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit for better chunking
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: 'esnext',
    // Minify options - using esbuild (faster than terser)
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    // Only scan the app entry HTML; avoids crawling unrelated *.html files
    // if a legacy snapshot accidentally contains leaked package folders.
    entries: ['index.html'],
    include: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-router',
      '@convex-dev/auth/react',
      'framer-motion',
    ],
  },
  // Performance hints
  server: {
    // Bind to all interfaces so WebContainer's server-ready event fires.
    host: true,
    port: 5173,
    // Keep HMR on, but disable full-screen error overlay
    hmr: {
      overlay: false,
    },
  },
});
