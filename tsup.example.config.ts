// tsup.example.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['example/demo.ts'],
    format: ['esm'],     // top-level await requires ESM
    target: 'esnext',    // or "es2022"
    outDir: 'dist/example',
    clean: false         // avoid cleaning your main build output
});
