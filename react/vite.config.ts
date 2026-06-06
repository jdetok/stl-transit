import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        root: ".",
        resolve: {
            alias: {
                "@": resolve(__dirname, "src"),
            },
        },
        build: {
            outDir: "dist",
            emptyOutDir: true,
        },
        server: {
            port: 9888,
            strictPort: true,
            proxy: {
                '/layers': {
                    target: 'http://localhost:9999',
                    changeOrigin: true,
                },
            }
        },
    }
});