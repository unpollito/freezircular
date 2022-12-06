export interface VerifyDepsProps {
  entryPath?: string;
  previousDepsPath?: string;
  tsConfig?: string | null;
}

export interface VerifyDepsResult {
  newDeps: string[][];
  remainingDeps: string[][];
  removedDeps: string[][];
}

export interface FreezircularConfig {
  autoAddDeps: boolean;
  entryPath: string;
  previousDepsPath: string;
  tsConfig: string | null;
  verbose: boolean;
}
