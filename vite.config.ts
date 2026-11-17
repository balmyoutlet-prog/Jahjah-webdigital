// Plain Vite + TanStack Start config. No hosted-builder wrapper: every plugin is
// listed here explicitly so the build is fully owned by this repository.
//
// Production builds go through Nitro, which auto-detects the hosting provider
// (Vercel sets VERCEL=1 during builds, so the `vercel` preset is used there).
// Override with NITRO_PRESET=<preset> if the site is ever moved elsewhere.
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, mode }) => {
  // Expose VITE_* vars to both client and SSR bundles at build time.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define,
    server: { host: "::", port: 8080 },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      // src/server.ts wraps the TanStack Start server entry with an SSR error page.
      tanstackStart({ server: { entry: "server" } }),
      ...(command === "build" ? [nitro()] : []),
      viteReact(),
    ],
  };
});
