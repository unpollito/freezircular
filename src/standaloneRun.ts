import { exec } from "child_process";
import fs from "fs";
import { FreezircularConfig, VerifyDepsResult } from "./types";
import { loadConfig } from "./config";
import { verifyCircularDeps } from "./verifyCircularDeps";

export const main = (): void => {
  const config = loadConfig();

  const isBaseline = process.argv.some((arg) => arg === "--baseline");

  verifyCircularDeps({
    entryPath: config.entryPath,
    previousDepsPath: config.previousDepsPath,
    tsConfig: config.tsConfig,
  }).then(
    (result) => {
      if (isBaseline) {
        onBaselineReceived(result, config);
      } else if (result.newDeps.length === 0) {
        onNoDepsAdded(result, config);
      } else {
        onNewDepsAdded(result);
      }
    },
    (e) => {
      console.error(
        "freezircular: could not verify circular deps, an error has occurred:"
      );
      console.error(e);
      process.exit(1);
    }
  );
};

const getPluralizedDependencyFragment = (num: number): string =>
  num === 1 ? "dependency has" : "dependencies have";

const getPluralizedDependencyWord = (num: number): string =>
  num === 1 ? "dependency" : "dependencies";

const onBaselineReceived = (
  result: VerifyDepsResult,
  config: FreezircularConfig
): void => {
  const numDeps = result.newDeps.length + result.remainingDeps.length;
  if (numDeps > 0) {
    writeDepsToDisk(config, [...result.remainingDeps, ...result.newDeps]);
    console.log(
      `All taken care of! You have ${numDeps} circular ${getPluralizedDependencyWord(
        numDeps
      )}.`
    );
    if (config.autoAddDeps) {
      addDepsToGit(config);
    }
  } else {
    console.log("You don't have any circular dependencies! 🚀");
  }
};

const onNoDepsAdded = (
  result: VerifyDepsResult,
  config: FreezircularConfig
): void => {
  const { remainingDeps, removedDeps } = result;
  if (config.verbose) {
    if (result.removedDeps.length > 0) {
      console.log(
        `✓ No new circular dependencies have been added, and ${
          removedDeps.length
        } ${getPluralizedDependencyFragment(
          removedDeps.length
        )} have been removed! 🚀`
      );
    } else {
      console.log("✓ No new circular dependencies have been added.");
    }
  }

  if (
    result.remainingDeps.length === 0 &&
    fs.existsSync(config.previousDepsPath)
  ) {
    if (config.autoAddDeps) {
      exec(`git rm -f ${config.previousDepsPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(
            `freezircular: failed to git rm ${config.previousDepsPath}:`
          );
          console.error(error);
          console.error(stderr);
          console.log(
            "We tried to remove this file as there are no more circular dependencies, but the operation failed. " +
              "You may need to remove this file manually."
          );
        }
      });
    } else {
      fs.rmSync(config.previousDepsPath);
    }
  } else if (
    result.removedDeps.length > 0 ||
    (result.remainingDeps.length > 0 && !fs.existsSync(config.previousDepsPath))
  ) {
    writeDepsToDisk(config, remainingDeps);
    if (config.autoAddDeps) {
      addDepsToGit(config);
    }
  }
};

const writeDepsToDisk = (
  config: FreezircularConfig,
  deps: string[][]
): void => {
  fs.writeFileSync(
    config.previousDepsPath,
    JSON.stringify(orderDependencies(deps), undefined, 2)
  );
};

const orderDependencies = (deps: string[][]) =>
  deps
    .map((dep) => {
      let minFile = dep[0];
      let minIndex = 0;
      dep.forEach((file, fileIndex) => {
        if (file < minFile) {
          minFile = file;
          minIndex = fileIndex;
        }
      });
      return [...dep.slice(minIndex), ...dep.slice(0, minIndex)];
    })
    .sort((a, b) => {
      let index = 0;
      while (a[index] && b[index]) {
        if (a[index] < b[index]) {
          return -1;
        } else if (a[index] > b[index]) {
          return 1;
        }
        index++;
      }
      if (!a[index]) {
        return -1;
      } else {
        return 1;
      }
    });

const addDepsToGit = (config: FreezircularConfig): void => {
  exec(`git add ${config.previousDepsPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(
        `freezircular: failed to git add ${config.previousDepsPath}:`
      );
      console.error(error);
      console.error(stderr);
      console.log("You may need to add this file manually.");
    }
  });
};

const onNewDepsAdded = (result: VerifyDepsResult): void => {
  const pluralizedFragment = getPluralizedDependencyFragment(
    result.newDeps.length
  );
  console.error(
    `${result.newDeps.length} circular ${pluralizedFragment} been added!`
  );
  for (const dep of result.newDeps) {
    const depToPrint = [...dep, dep[0]];
    console.log(depToPrint.join(" -> "));
  }
  process.exit(1);
};
