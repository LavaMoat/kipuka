
import {
  kipuka,
  withDefaults,
  without,
  withCliWrapEntrypoint,
  requireExtensions,
  withHelp,
  withParentHost,
  withNpmPackages,
} from "@lavamoat/kipuka";

export default [
  ...without(kipuka, ["withEntrypoint", "withHelp"]),
  withNpmPackages(["npm@latest","pnpm@latest"]),
  withParentHost(),
  withDefaults({
    name: "cli",
  }),
  withHelp('k-help'),
  ...requireExtensions("cli"),
  withCliWrapEntrypoint()
];
