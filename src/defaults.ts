import { FreezircularConfig } from "./types";

export const defaultPaths = [
  "index.ts",
  "src/index.ts",
  "index.js",
  "src/index.js",
];

export const defaultConfig: Omit<FreezircularConfig, "entryPath"> = {
  autoAddDeps: true,
  previousDepsPath: ".freezircularDeps",
  verbose: true,
};
