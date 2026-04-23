# Kipuka 

> ⚠️ EXPERIMENTAL [WIP] - USE AT YOUR OWN RISK ([learn more](#Disclaimer))

> [!TIP]
> Early release - for feedback and contributions
> We're releasing a version that has room for improvements and you're invited to propose fixes when it doesn't work for you.


Easy, composable and transparent way to run things in a docker container.

![kipuka illustration](./kipuka.jpg)
> [kipuka](https://en.wikipedia.org/wiki/Kipuka) - island of older ecosystem preserved within volcanic lava flows.  
> Because our ecosystem gives you things to run that are better left on an island among lava...

---


## Transparently protect all your installs and script runs

Want to keep using the tools you're used to but get additional security?

Set up once, and every time you run `npm [anything]` it will run in a container.

### Quick Start

> You need docker installed in your system

```bash
# Install kipuka globally
# (It will be published to npm as @lavamoat/kipuka after some more tests)
npm install -g https://github.com/lavamoat/kipuka

# Initialize configuration
kipuka-ctl init

# Set up shell aliases for package managers in your current shell
eval $(kipuka-ctl alias)
## or put `eval $(kipuka-ctl alias)` at the end of your .bashrc
```

Now npm, yarn, pnpm run in docker containers


```
npm install
npm install --save-dev eslint
npm run build
npx create-next-app my-app
```


Kipuka lets you run any CLI tool in a containerized environment without polluting your host system or worrying about what that sketchy package is actually doing.


### Start bash in kipuka in your current folder

```
kipuka
```

With custom options
```
kipuka -- --help
```

Run your own composition from `~/.kipuka/my.js`
```
kipuka my --help
```

### Clean up when you have too many

Run `kipuka-ctl cleanup` and it'll help you clean things up one by one.


### Hardened alias

To use a hardened version of npm install, try:

```
alias npmi='kipuka cli-hardened'
```

The current version has a few tweaks, options to run offline and limit node permissions and uses `npq` instead of your package manager of choice. It's a work in progress and not ready to be an npm replacement, just npm install replacement.

## Commands

### `kipuka --`
Run the default kipuka environment.

### `kipuka <name>`
Run a custom kipuka defined in `~/.kipuka/<name>.js`.

### `kipuka-ctl init`
Initialize kipuka configuration directory at `~/.kipuka/` with:
- `kipuka.config.js` - Global configuration
- `example.js` - Example custom kipuka
- `package.json` - Node.js module configuration
- and more batterries-included useful compositions

### `kipuka-ctl alias`
Output and run shell aliases for package managers. 

You can put `kipuka-ctl alias` at the end of your .bashrc or copy its output for an immutable version.

### `kipuka-cli cleanup`
Interactively stop and remove selected kipuka containers and images. Keeps your Docker environment tidy.

## Configuration

Edit `~/.kipuka/kipuka.config.js` to customize:

```javascript
/** @type {KipukasGlobalConfig} */
export default {
  extensions: {
    // Extensions for all kipukas
    root: [withPackages(['vim', 'curl'])],
    user: [withEnv({ EDITOR: 'vim' })],
  },
  // Commands to alias to kipuka
  aliases: ['npm', 'npx', 'pnpm', 'pnpx', 'yarn', 'yarnpkg']
};
```

---


## Composing Your Own Kipuka

Create custom environments by composing components in `~/.kipuka/<name>.js`:

```javascript
import { kipuka, without, withDefaults, withPackages } from '@lavamoat/kipuka';

export default [
  ...without(kipuka, ["withDefaults"]),
  withDefaults({ name: "my-secure-env", from: "node:lts" }),
  withPackages(['git', 'vim', 'curl']),
  withEnv({ NODE_ENV: 'development' })
];
```

Run it with `kipuka <name>`

### Available Components

Your IDE should help you because they're typed, see the `with*` you can import.

Brief documentation for reference: [components.md](./components.md)

## How It Works

Kipuka creates isolated Docker containers for running CLI tools and development environments. Each kipuka is composed of reusable components that modify the Docker image and runtime configuration. When you run a command through kipuka, it:

1. Builds a custom Docker image based on your component composition
2. Mounts your current directory and relevant config files
3. Runs your command in the isolated container

Your files stay on the host, but the execution environment is isolated.


# Known limitations

Upgrading to a new version with breaking changes requires:

- running `kipuka-ctl init --force`
- rebuilding default images, eg. `kipuka -- --kipuka-rebuild` and `kipuka cli --kipuka-rebuild`

A more streamlined process will emerge. Feel free to create an issue with suggestions.

---


# Disclaimer

No warranty of any kind, as the MIT license says.

This isn't a military-grade solution. Container escape vulnerabilities exist.  
There are attacks that this will not defend from (see other lavamoat tools BTW).  
This is a tool that optimizes for ease of use and no changes to your existing workflow. 

When escaping a bear, you don't have to outrun the bear, just the person next to you.