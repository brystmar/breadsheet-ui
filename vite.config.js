import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [react()],
    server: { port: 3000 },
    test: {
        environment: "jsdom",
        setupFiles: ["./src/setupTests.js"],
        globals: true,
        // Tests mock fetch, so any backend works; this keeps them independent of the git-ignored .env files
        env: { VITE_BACKEND_URL: "http://backend.test" },
    },
})
