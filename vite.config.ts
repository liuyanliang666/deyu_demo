import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { codeInspectorPlugin } from "code-inspector-plugin";
import removeConsole from "vite-plugin-remove-console";

import { resolve } from "node:path";

const vendorMap = new Map<string, string>([
  /* ---------- React ---------- */
  ["react", "react-vendor"],
  ["react-dom", "react-vendor"],

  /* ---------- TanStack ---------- */
  ["@tanstack/react-router", "tanstack-router"],
  ["@tanstack/react-router-devtools", "tanstack-router"],
  ["@tanstack/react-query", "tanstack-query"],
  ["@tanstack/react-query-devtools", "tanstack-query"],
  ["@tanstack/react-form", "tanstack-form"],
  ["@tanstack/react-store", "tanstack-store"],
  ["@tanstack/store", "tanstack-store"],

  /* ---------- Radix UI ---------- */
  ["@radix-ui/react-accordion", "radix-ui"],
  ["@radix-ui/react-alert-dialog", "radix-ui"],
  ["@radix-ui/react-aspect-ratio", "radix-ui"],
  ["@radix-ui/react-avatar", "radix-ui"],
  ["@radix-ui/react-checkbox", "radix-ui"],
  ["@radix-ui/react-collapsible", "radix-ui"],
  ["@radix-ui/react-context-menu", "radix-ui"],
  ["@radix-ui/react-dialog", "radix-ui"],
  ["@radix-ui/react-dropdown-menu", "radix-ui"],
  ["@radix-ui/react-hover-card", "radix-ui"],
  ["@radix-ui/react-label", "radix-ui"],
  ["@radix-ui/react-menubar", "radix-ui"],
  ["@radix-ui/react-navigation-menu", "radix-ui"],
  ["@radix-ui/react-popover", "radix-ui"],
  ["@radix-ui/react-progress", "radix-ui"],
  ["@radix-ui/react-radio-group", "radix-ui"],
  ["@radix-ui/react-scroll-area", "radix-ui"],
  ["@radix-ui/react-select", "radix-ui"],
  ["@radix-ui/react-separator", "radix-ui"],
  ["@radix-ui/react-slider", "radix-ui"],
  ["@radix-ui/react-slot", "radix-ui"],
  ["@radix-ui/react-switch", "radix-ui"],
  ["@radix-ui/react-tabs", "radix-ui"],
  ["@radix-ui/react-toggle", "radix-ui"],
  ["@radix-ui/react-toggle-group", "radix-ui"],
  ["@radix-ui/react-tooltip", "radix-ui"],
  ["@radix-ui/react-use-controllable-state", "radix-ui"],

  /* ---------- utils ---------- */
  ["clsx", "utils"],
  ["tailwind-merge", "utils"],
  ["class-variance-authority", "utils"],
  ["date-fns", "utils"],
  ["zod", "utils"],
  ["axios", "utils"],

  /* ---------- UI components ---------- */
  ["cmdk", "ui-components"],
  ["embla-carousel-react", "ui-components"],
  ["input-otp", "ui-components"],
  ["lucide-react", "ui-components"],
  ["react-day-picker", "ui-components"],
  ["react-resizable-panels", "ui-components"],
  ["react-syntax-highlighter", "ui-components"],
  ["sonner", "ui-components"],
  ["vaul", "ui-components"],
  ["use-stick-to-bottom", "ui-components"],

  /* ---------- animation & charts ---------- */
  ["gsap", "animation-charts"],
  ["@gsap/react", "animation-charts"],
  ["recharts", "animation-charts"],

  /* ---------- theming ---------- */
  ["next-themes", "theming"],

  /* ---------- forms ---------- */
  ["react-hook-form", "forms"],
  ["@hookform/resolvers", "forms"],

  /* ---------- AI ---------- */
  ["ai", "ai"],
  ["streamdown", "ai"],
]);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    codeInspectorPlugin({
      editor: "cursor",
      bundler: "vite",
      hotKeys: ['ctrlKey'],

    }),
    viteReact(),
    tailwindcss(),
    removeConsole()
  ],
  // test: {
  //   globals: true,
  //   environment: 'jsdom',
  // },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return null; // 只拆 npm 包
          const parts = id.split("node_modules/");
          const path = parts[parts.length - 1]; // eg  "@tanstack/react-query/dist/...
          const pkgName = path.startsWith("@")
            ? path.slice(0, path.indexOf("/", path.indexOf("/") + 1)) // scoped
            : path.slice(0, path.indexOf("/")); // normal

          return vendorMap.get(pkgName) ?? null;
        },
      },
    },
    // 增加 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 优化依赖预构建
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
