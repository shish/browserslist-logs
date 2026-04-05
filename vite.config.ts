import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["cjs"],
            fileName: () => "index.js",
        },
        rollupOptions: {
            external: [
                /^node:/,
                "browserslist",
                "browserslist-useragent",
                "commander",
            ],
        },
        target: "node18",
    },
    test: {
        globals: true,
    },
});
