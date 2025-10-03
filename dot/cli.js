
import {
  kipuka,
  withDefaults,
  without,
  withCliWrapEntrypoint,
  requireExtensions,
  withHelp,
  withNpmPackages,
} from "@lavamoat/kipuka";

export default [
  ...without(kipuka, ["withEntrypoint", "withHelp"]),
  withNpmPackages(["npm@latest"]),
  withDefaults({
    name: "cli",
  }),
  withHelp('k-help'),
  ...requireExtensions("cli"),
  withCliWrapEntrypoint()
];
