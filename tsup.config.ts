import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2022",
  dts: true,
  minify: true,
  sourcemap: false,
  treeshake: true,
  clean: true,
  external: ["electron"],
});
