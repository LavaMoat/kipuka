/** @typedef {import('./types').KipukaComponent} KipukaComponent */
/** @typedef {import('./types').KipukaOption} KipukaOption */
/** @typedef {import('./types').KipukaConfig} KipukaConfig */

import { existsSync } from "node:fs";
import { config } from "./conf.js";

/**
 * Creates a component that mounts the current directory into the container
 * @param {string} [path="/mountpoint"] - Path to mount
 * @param {string} [user="node"] - User to own the mountpoint
 * @returns {KipukaComponent}
 */
export const withMountpoint = (path = "/mountpoint", user) => ({
  id: "withMountpoint",
  options: [],
  handler: () => {
    return {
      imageTransforms: [
        (setup = []) => [
          ...setup,
          `RUN mkdir ${path}`,
          `RUN chown -R ${user}:${user} ${path}`,
          `WORKDIR ${path}`,
        ],
      ],
      runArgsTransforms: [
        (args) => ["-v", `${process.cwd()}:${path}`, ...args],
      ],
    };
  },
});
/**
 * Creates a component that mounts a specific folder inside the container
 * @param {string} path - Path to mount
 * @param {string} [user="node"] - User to own the mountpoint
 * @returns {KipukaComponent}
 */
export const withFolderFromHome = (path, user='node') => ({
  id: "withFolderFromHome",
  options: [],
  handler: () => {
    if(!path || !existsSync(`${process.env.HOME}/${path}`)) {
      throw new Error(`Folder ${process.env.HOME}/${path} does not exist, cannot mount`);
    }
    return {
      runArgsTransforms: [
        (args) => ["-v", `${process.env.HOME}/${path}:/home/${user}/${path}`, ...args],
      ],
    };
  },
});
/**
 * Creates a component that sets up corepack in the container
 * @returns {KipukaComponent}
 */
export const withCorepack = () => ({
  id: "withCorepack",
  options: [],
  handler: () => {
    return {
      imageTransforms: [
        (setup = []) => [
          `ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0`,
          `ENV COREPACK_HOME=/corepack-cache`,
          `RUN mkdir -p /corepack-cache`,
          `RUN chmod 777 /corepack-cache`,
          `RUN npm install -g corepack`,
          ...setup,
          `RUN corepack enable`,
        ],
      ],
      runArgsTransforms: [
        (args, { name }) => ["-v", `${name}_corepack_cache:/corepack-cache`, ...args],
      ],
    };
  },
});

/**
 * Creates a component that adds offline mode option
 * @returns {KipukaComponent}
 */
export const withOfflineOption = (optName = "offline") => ({
  id: "withOfflineOption",
  options: [
    {
      name: optName || "offline",
      type: "boolean",
      description: "Run container with network access disabled",
    },
  ],
  handler: ({ values }) => ({
    runArgsTransforms: values[optName]
      ? [(args) => [...args, "--network", "none"]]
      : [],
  }),
});

export const withParentHost = (name) => ({
  id: "withParentHost",
  options: [],
  handler: () => ({
    runArgsTransforms: [
      (args) => [
        `--add-host`,
        `${name || "parent.host"}:host-gateway`,
        ...args,
      ],
    ],
  }),
});

/**
 * Creates a component that provides default values
 * @param {Object} [defaults={}] - Default values
 * @returns {KipukaComponent}
 */
export const withDefaults = (defaults = {}) => ({
  id: "withDefaults",
  options: [],
  handler: () => defaults,
});
/**
 * Creates a component that adds help option
 * @param {string} [key] - the name of the flag to use for help print
 * @returns {KipukaComponent}
 */
export const withHelp = (key = "help") => ({
  id: "withHelp",
  options: [
    {
      name: key || "help",
      type: "boolean",
      description: "Show help information",
    },
  ],
  handler: ({ values, options = [] }) => {
    if (values[key]) {
      console.log(`Usage:
kipuka -- [OPTIONS]
kipuka run [NAME] -- [OPTIONS]
Options:
  ${options.map((opt) => `--${opt.name}\t ${opt.description}`).join("\n  ")}`);
      process.exit(0);
    }
    return {};
  },
});

/**
 * Creates a component that enables interactive mode
 * @returns {KipukaComponent}
 */
export const withInteractive = () => ({
  id: "withInteractive",
  options: [],
  handler: () => ({
    runArgsTransforms: [
      (args) => ["-it", "-e", `TERM=${process.env.TERM}`, ...args],
    ],
  }),
});
/**
 * Creates a component that enables detached mode
 * @returns {KipukaComponent}
 */
export const withDetached = () => ({
  id: "withDetached",
  options: [],
  handler: () => ({
    runArgsTransforms: [(args) => ["-d", ...args]],
  }),
});

/**
 * Creates a component that adds package installation option
 * @returns {KipukaComponent}
 */
export const withPackagesOption = () => ({
  id: "withPackagesOption",
  options: [
    {
      name: "apt",
      type: "string",
      description: "Comma-separated list of packages to install with apt",
    },
  ],
  handler: ({ values }) => {
    if (values.apt && !values["kipuka-rebuild"]) {
      console.warn(
        "Warning: --apt needs --kipuka-rebuild to take effect (packages are baked into the image)",
      );
    }
    return {
      imageTransforms: values.apt
        ? [
            (setup) => [
              `RUN apt update && apt install -y ${values.apt
                .split(",")
                .join(" ")}`,
              ...setup,
            ],
          ]
        : [],
    };
  },
});
/**
 * Creates a component that adds package installation option
 * @returns {KipukaComponent}
 */
export const withNpmPackagesOption = () => ({
  id: "withNpmPackagesOption",
  options: [
    {
      name: "npm",
      type: "string",
      description: "Comma-separated list of packages to install with npm -g",
    },
  ],
  handler: ({ values }) => {
    if (values.npm && !values["kipuka-rebuild"]) {
      console.warn(
        "Warning: --npm needs --kipuka-rebuild to take effect (packages are baked into the image)",
      );
    }
    return {
      imageTransforms: values.npm
        ? [
            (setup) => [
              `RUN npm install -g ${values.npm.split(",").join(" ")}`,
              ...setup,
            ],
          ]
        : [],
    };
  },
});

/**
 * Creates a component that installs specified packages
 * @param {string[]} packages - Packages to install
 * @returns {KipukaComponent}
 */
export const withPackages = (packages) => ({
  id: "withPackages",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [
        `RUN apt update && apt install -y ${packages.join(" ")}`,
        ...setup,
      ],
    ],
  }),
});
/**
 * Creates a component that installs specified packages
 * @param {string[]} packages - Packages to install
 * @returns {KipukaComponent}
 */
export const withNpmPackages = (packages) => ({
  id: "withNpmPackages",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [`RUN npm install -g ${packages.join(" ")}`, ...setup],
    ],
  }),
});

/**
 * Creates a component that adds RUN commands
 * @param {string[]} runs - Commands to run
 * @returns {KipukaComponent}
 */
export const withRuns = (runs) => ({
  id: "withRuns",
  options: [],
  handler: ({ values }) => ({
    imageTransforms: [
      (setup) => [...runs.map((run) => `RUN ${run}`), ...setup],
    ],
  }),
});
/**
 * Creates a component that adds RUN commands
 * @param {string} cmd - Commands to run
 * @returns {KipukaComponent}
 */
export const withCMD = (cmd) => ({
  id: "withCMD",
  options: [],
  handler: ({ values }) => ({
    imageTransforms: [
      (setup) => {
        if (setup[setup.length - 1]?.startsWith("CMD ")) {
          throw new Error("CMD command already set, cannot add another one");
        }
        return [...setup, `CMD ${cmd}`];
      },
    ],
  }),
});
/**
 * Creates a component that adds RUN commands
 * @param {string} user - Commands to run
 * @returns {KipukaComponent}
 */
export const withUser = (user) => ({
  id: "withUser",
  options: [
    {
      name: "history",
      type: "boolean",
      description: "Mount local bash history into container",
    },
  ],
  handler: ({ values }) => ({
    imageTransforms: [
      (setup) => {
        if (setup[setup.length - 1]?.startsWith("USER ")) {
          throw new Error("USER command already set, cannot add another one");
        }
        return [...setup, `USER ${user}`];
      },
    ],
    runArgsTransforms: values.history
      ? [
          (args) => [
            ...args,
            "-v",
            `${process.env.HOME}/.bash_history:/home/${user}/.bash_history`,
          ],
        ]
      : [],
  }),
});
/**
 * Creates a component that exposes a specific port
 * @param {number} port - Port number to expose
 * @returns {KipukaComponent}
 */
export const withPort = (port) => ({
  id: "withPort",
  options: [],
  handler: () => ({
    runArgsTransforms: [(args) => [...args, "-p", `${port}:${port}`]],
  }),
});

/**
 * Selects an entrypoint from a flag
 * @returns {KipukaComponent}
 */
export const withCliWrapEntrypoint = () => ({
  id: "withCliWrapEntrypoint",
  options: [
    {
      name: "k-wrap-cli",
      type: "string",
      description: "cli command to run as entrypoint",
    },
  ],
  handler: ({ values }) => ({
    runArgsTransforms: [
      (args) => {
        const cli = values["k-wrap-cli"];
        if (!cli) {
          return args;
        }
        process.argv = process.argv.filter(
          (arg) => !arg.startsWith("--k-wrap-cli="),
        );
        return [...args, "--init", "--entrypoint", cli];
      },
    ],
  }),
});

/**
 * Selects an entrypoint for the docker container
 * @param {string} entrypoint - Port number to expose
 * @returns {KipukaComponent}
 */
export const withEntrypoint = (entrypoint) => ({
  id: "withEntrypoint",
  options: [],
  handler: () => ({
    runArgsTransforms: [
      (args) => [...args, "--init", "--entrypoint", entrypoint],
    ],
  }),
});

/**
 * Creates a component that adds a port exposure option
 * @returns {KipukaComponent}
 */
export const withPortsOption = () => ({
  id: "withPortOption",
  options: [
    {
      name: "portforward",
      type: "string",
      description: "Port number to expose from the container",
    },
  ],
  handler: ({ values }) => ({
    runArgsTransforms: values.portforward ? [(args) => [...args, "-P"]] : [],
  }),
});

/**
 * Creates a component that adds a file to the container
 * @param {string} path - Path where to create the file in container
 * @param {string} content - Content of the file
 * @returns {KipukaComponent}
 */
export const withFile = (path, content) => ({
  id: "withFile",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [...setup, `RUN cat <<'EOF' > ${path}\n${content}\nEOF`],
    ],
  }),
});

/**
 * Creates a component that adds command aliases to the container
 * @param {Object.<string, string>} aliases - Object mapping alias names to commands
 * @returns {KipukaComponent}
 */
export const withAliases = (aliases) => ({
  id: "withAliases",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [
        ...setup,
        ...Object.entries(aliases).map(
          ([alias, command]) =>
            `RUN echo 'alias ${alias}="${command.replace(
              /"/g,
              '\\"',
            )}"' >> ~/.bashrc`,
        ),
      ],
    ],
  }),
});

/**
 * Creates a component that sets environment variables in the container
 * @param {Object.<string, string>} env - Object mapping environment variable names to values
 * @returns {KipukaComponent}
 */
export const withEnv = (env) => ({
  id: "withEnv",
  options: [],
  handler: () => ({
    imageTransforms: [
      (setup) => [
        ...setup,
        ...Object.entries(env).map(([key, value]) => `ENV ${key}=${value}`),
      ],
    ],
  }),
});

/**
 * Creates a component that prints an ASCII art of a kipuka
 * @returns {KipukaComponent}
 */
export const withArt = () => ({
  id: "withArt",
  options: [],
  handler: () => {
    console.log(` . ∘  ◯ ◦ (running in a kipuka) ○◦ *  •`);
    return {};
  },
});

/**
 * Creates a component that adds user-provided Docker run arguments
 * @param {string[]} userArgs - User-provided Docker run arguments
 * @returns {KipukaComponent}
 */
export const withDockerRunArgs = (userArgs = []) => ({
  id: "withDockerRunArgs",
  options: [],
  handler: () => ({
    runArgsTransforms: [(args) => [...userArgs, ...args]],
  }),
});

/**
 * Loads extensions from ~/.kipuka/extensions.js and returns them assuming they're a list of components.
 * @param {string} name - Name of the extension to load
 * @returns {KipukaComponent[]}
 */
export const requireExtensions = (name) => {
  if (config) {
    const extensions = config.extensions || {};

    if (extensions[name] && Array.isArray(extensions[name])) {
      return extensions[name];
    }
  }
  return [];
};
