
import {
  kipuka,
  withDefaults,
  without,
  withCliWrapEntrypoint,
  requireExtensions,
  withHelp,
  withParentHost,
  withNpmPackages,
  withCorepack,
  withEnv,
} from "@lavamoat/kipuka";

export default [
  ...without(kipuka, ["withEntrypoint", "withHelp", "withCorepack"]),
  withDefaults({
    name: "cli",
  }),
  withHelp('k-help'),
  withCorepack("kipuka_cli_corepack_cache"),
  withParentHost(),
  withEnv({
    YARN_ENABLE_GLOBAL_CACHE:false,
    YARN_ENABLE_MIRROR:false,
    YARN_GLOBAL_FOLDER: "./.kipuka-yarn-cache",
  }),
  withNpmPackages(["npm@latest","pnpm@latest"]),
  ...requireExtensions("cli"),
  withCliWrapEntrypoint()
];
