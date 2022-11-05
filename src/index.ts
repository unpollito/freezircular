import { main } from "./standaloneRun";

export { verifyCircularDeps } from "./verifyCircularDeps";
export type {
  FreezircularConfig,
  VerifyDepsProps,
  VerifyDepsResult,
} from "./types";

if (require.main === module) {
  main();
}
