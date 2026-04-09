import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: { resolve: true },
  clean: true,
  sourcemap: true,
  bundle: false,
  splitting: false,
  external: ["fsevents"],
  loader: {
    ".node": "empty",
  },
});
