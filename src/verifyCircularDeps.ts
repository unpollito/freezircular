import { VerifyDepsProps, VerifyDepsResult } from "./types";
import { getDefaultEntryPath } from "./config";
import madge from "madge";
import { defaultConfig } from "./defaults";
import fs from "fs";

export const verifyCircularDeps = async (
  params?: VerifyDepsProps
): Promise<VerifyDepsResult> => {
  params = params || {};
  const entryPath = params.entryPath ?? getDefaultEntryPath();
  const previousDepsPath =
    params.previousDepsPath ?? defaultConfig.previousDepsPath;
  const previousDeps = loadPreviousDeps(previousDepsPath);
  const madgeResult = await madge(entryPath, {
    fileExtensions: ["js", "jsx", "ts", "tsx"],
    tsConfig: params.tsConfig ?? null,
  });
  const circularDeps = madgeResult.circular();

  const previousDepsFound: boolean[] = new Array(previousDeps.list.length).fill(
    false
  );
  const newDeps = [];
  const remainingDeps = [];
  const removedDeps = [];

  for (const [index, dep] of circularDeps.entries()) {
    // Ignore dependencies with length 1 (a file depending on itself) - these could be caused by this issue:
    // https://github.com/pahen/madge/issues/306
    if (dep.length > 1) {
      if (getIsOldDependency({ dep, previousDeps })) {
        previousDepsFound[index] = true;
        remainingDeps.push(dep);
      } else {
        newDeps.push(dep);
      }
    }
  }

  for (const [index, wasFound] of previousDepsFound.entries()) {
    if (!wasFound) {
      removedDeps.push(previousDeps.list[index]);
    }
  }

  return {
    newDeps,
    remainingDeps,
    removedDeps,
  };
};

const getIsOldDependency = ({
  dep,
  previousDeps,
}: {
  dep: string[];
  previousDeps: PreviousDeps;
}): boolean => {
  // Consider that [a,b,c], [b,c,a] and [c,a,b] are the same dependency.
  const filesByNumOfDeps = dep.map((file, index) => ({
    index,
    numDeps: previousDeps.fileToDepsMap[file]?.size ?? 0,
  }));
  if (filesByNumOfDeps.some((entry) => entry.numDeps === 0)) {
    return false;
  }
  const sortedFiles = filesByNumOfDeps.sort((a, b) => a.numDeps - b.numDeps);
  const entryWithFewestDeps = dep[sortedFiles[0].index];
  const filePreviousDeps = [
    ...previousDeps.fileToDepsMap[entryWithFewestDeps],
  ].map((index) => previousDeps.list[index]);

  const resortedDep = [
    ...dep.slice(sortedFiles[0].index),
    ...dep.slice(0, sortedFiles[0].index),
  ];
  return filePreviousDeps.some((currentDep) => {
    if (currentDep.length !== resortedDep.length) {
      return false;
    }
    const fileIndex = currentDep.indexOf(entryWithFewestDeps);
    const resortedCurrentDep = [
      ...currentDep.slice(fileIndex),
      ...currentDep.slice(0, fileIndex),
    ];
    return JSON.stringify(resortedDep) === JSON.stringify(resortedCurrentDep);
  });
};

interface PreviousDeps {
  fileToDepsMap: Record<string, Set<number>>;
  list: string[][];
}

const loadPreviousDeps = (path: string): PreviousDeps => {
  let previousDepString: string;
  try {
    previousDepString = fs.readFileSync(path).toString();
  } catch (e) {
    previousDepString = "[]";
  }

  let previousDepArray: string[][];
  try {
    previousDepArray = JSON.parse(previousDepString);
    if (
      !Array.isArray(previousDepArray) ||
      (previousDepArray.length > 0 && !Array.isArray(previousDepArray[0]))
    ) {
      throw new Error("Not a valid circular dependency list");
    }
  } catch (e) {
    console.error("Could not parse old dependencies.");
    throw e;
  }

  const fileToDepsMap: PreviousDeps["fileToDepsMap"] = {};
  for (const [index, dep] of previousDepArray.entries()) {
    for (const file of dep) {
      if (!fileToDepsMap[file]) {
        fileToDepsMap[file] = new Set();
      }
      fileToDepsMap[file].add(index);
    }
  }

  return { fileToDepsMap, list: previousDepArray };
};
