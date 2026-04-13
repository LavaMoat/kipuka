# Components


### `withMountpoint`

Creates a component that mounts the current directory into the container

**Parameters:**

- {string} `[path="/mountpoint"]` — Path to mount
- {string} `[user="node"]` — User to own the mountpoint

### `withOfflineOption`

Creates a component that adds offline mode option

### `withDefaults`

Creates a component that provides default values

**Parameters:**

- {Object} `[defaults={}]` — Default values

### `withHelp`

Creates a component that adds help option

**Parameters:**

- {string} `[key]` — the name of the flag to use for help print

### `withInteractive`

Creates a component that enables interactive mode

### `withDetached`

Creates a component that enables detached mode

### `withPackagesOption`

Creates a component that adds package installation option

### `withNpmPackagesOption`

Creates a component that adds package installation option

### `withPackages`

Creates a component that installs specified packages

**Parameters:**

- {string[]} `packages` — Packages to install

### `withNpmPackages`

Creates a component that installs specified packages

**Parameters:**

- {string[]} `packages` — Packages to install

### `withRuns`

Creates a component that adds RUN commands

**Parameters:**

- {string[]} `runs` — Commands to run

### `withCMD`

Creates a component that adds RUN commands

**Parameters:**

- {string} `cmd` — Commands to run

### `withUser`

Creates a component that adds RUN commands

**Parameters:**

- {string} `user` — Commands to run

### `withPort`

Creates a component that exposes a specific port

**Parameters:**

- {number} `port` — Port number to expose

### `withCliWrapEntrypoint`

Selects an entrypoint from a flag

### `withEntrypoint`

Selects an entrypoint for the docker container

**Parameters:**

- {string} `entrypoint` — Port number to expose

### `withPortsOption`

Creates a component that adds a port exposure option

### `withFile`

Creates a component that adds a file to the container

**Parameters:**

- {string} `path` — Path where to create the file in container
- {string} `content` — Content of the file

### `withAliases`

Creates a component that adds command aliases to the container

**Parameters:**

- {Object.<string, string>} `aliases` — Object mapping alias names to commands

### `withEnv`

Creates a component that sets environment variables in the container

**Parameters:**

- {Object.<string, string>} `env` — Object mapping environment variable names to values

### `withArt`

Creates a component that prints an ASCII art of a kipuka

### `withDockerRunArgs`

Creates a component that adds user-provided Docker run arguments

**Parameters:**

- {string[]} `userArgs` — User-provided Docker run arguments

### `requireExtensions`

Loads extensions from ~/.kipuka/extensions.js and returns them assuming they're a list of components.

**Parameters:**

- {string} `name` — Name of the extension to load


## Types

- `{import('./types').KipukaComponent} KipukaComponent`
- `{import('./types').KipukaOption} KipukaOption`
- `{import('./types').KipukaConfig} KipukaConfig`