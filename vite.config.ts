import { defineConfig } from "vite"
import vituum from "vituum"

export default defineConfig({
    base: process.env.BASE_PATH || "/",
    build: {
        sourcemap: true
    },
    plugins: [
        vituum()
    ]
})