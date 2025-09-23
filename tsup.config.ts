import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'], // Build for commonJS and ESmodules
    dts: { entry: "src/index.ts" }, // Generate declaration file (.d.ts)
    splitting: false,
    sourcemap: true,
    clean: true,
});
