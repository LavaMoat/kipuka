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


// adapt input to `sfw` expectations. Conveniently, we have an argument that contains the package manager name
const installArgs = ["install", "i", "add", "ci"];
if(installArgs.includes(process.argv[3].toLowerCase())) {
  process.argv[2] = process.argv[2].replace('--k-wrap-cli=', '')
}

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
    from: "dhi.io/node:25-debian13-sfw-dev",
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
  withNpmPackages(["npm@latest", "sfw@latest", "pnpm@latest"]),
  ...requireExtensions("cli"),
  withCliWrapEntrypoint()
];
