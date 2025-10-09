import {
  kipuka,
  withDefaults,
  without,
  withHelp,
  withFile,
  requireExtensions,
  withCliWrapEntrypoint,
  withNpmPackages,
  withRuns,
  withOfflineOption,
} from "@lavamoat/kipuka";

const withNodePermsOption = () => ({
  id: "withNodePermsOption",
  options: [
    {
      name: "k-node-lock",
      type: "boolean",
      description:
        "configure node.js permissions to only read, no write, no spawn",
    },
  ],
  handler: ({ values }) => ({
    imageTransforms: [
      (setup) =>
        values["k-node-lock"]
          ? [...setup, `ENV NODE_OPTIONS="--permissions --allow-fs-read=./ "`]
          : setup,
    ],
  }),
});

const npmrc = `
ignore-scripts=true
prefix=/home/node/.npm-packages
`;

export default [
  ...without(kipuka, ["withEntrypoint", "withHelp"]),
  withDefaults({
    name: "cli-hrd",
  }),
  withHelp("k-help"),
  withRuns([
    "mkdir /home/node/.npm-packages",
    "chown node /home/node/.npm-packages",
  ]),
  withOfflineOption("k-offline"),
  withNodePermsOption(),
  withFile("/home/node/.npmrc", npmrc),
  ...requireExtensions("cli"),
  withCliWrapEntrypoint()
];
