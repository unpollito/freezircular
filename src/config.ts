import { FreezircularConfig } from "./types";
import fs from "fs";
import { defaultConfig, defaultPaths } from "./defaults";

export const loadConfig = (): FreezircularConfig => {
  let packageJson: { freezircular?: Partial<FreezircularConfig> };
  try {
    packageJson = JSON.parse(fs.readFileSync("package.json").toString());
  } catch (e) {
    console.error("freezircular: could not read config from package.json file");
    throw e;
  }

  const config: Omit<FreezircularConfig, "entryPath"> = {
    ...defaultConfig,
    ...(packageJson.freezircular ?? {}),
  };
  const entryPath = getEntryPath(config);
  if (!entryPath) {
    console.error(
      "freezircular: could not locate an entry point and no entryPath set in package.json"
    );
    throw new Error("Missing required config: entryPath");
  } else if (!fs.existsSync(entryPath)) {
    console.error(`freezircular: could not open entry point ${entryPath}`);
    throw new Error("Could not read entry point");
  }

  return { ...config, entryPath };
};

const getEntryPath = (
  freezircularConfig: Partial<FreezircularConfig>
): string | undefined => {
  if (freezircularConfig.entryPath) {
    return freezircularConfig.entryPath;
  }
  return getDefaultEntryPath();
};

export const getDefaultEntryPath = (): string | undefined => {
  for (const path of defaultPaths) {
    if (fs.existsSync(path)) {
      return path;
    }
  }
  return undefined;
};
