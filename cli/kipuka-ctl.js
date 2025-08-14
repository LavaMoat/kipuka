#!/usr/bin/env node
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { cp, mkdir } from "fs/promises";
import { join } from "path";
import { parseArgs } from "node:util";
import {
  globalConfigDir,
  readGlobalConfig,
  promptUser,
} from "../framework/internal.js";

/**
 * Execute Docker command with user confirmation
 * @param {string[]} args
 * @param {string} description
 */
const executeDockerCommand = async (args, description) => {
  const confirmed = await promptUser(`${description}?`);
  if (confirmed) {
    const result = spawnSync("docker", args, { stdio: "inherit" });
    if (result.status !== 0) {
      console.error(
        `Failed to execute: docker ${args.join(" ")}`,
        result.stderr.toString()
      );
    }
  } else {
    console.log(`Skipped: docker ${args.join(" ")}`);
  }
};

const commands = {
  async cleanup() {
    const containerList = spawnSync("docker", [
      "ps",
      "-a",
      "--filter",
      "name=kipuka-",
      "--format",
      "{{.Names}}",
    ]);
    if (containerList.stdout) {
      const containers = containerList.stdout
        .toString()
        .trim()
        .split("\n")
        .filter(Boolean);
      if (containers.length > 0) {
        console.log(
          `Found ${containers.length} kipuka containers: ${containers.join(
            ", "
          )}`
        );
        for (const container of containers) {
          await executeDockerCommand(
            ["stop", container],
            `Stop container ${container}`
          );
          await executeDockerCommand(
            ["rm", container],
            `Remove container ${container}`
          );
        }
      } else {
        console.log("No kipuka containers found");
      }
    } else {
      console.log("Empty output from docker ps.");
    }

    // Remove images
    const imageList = spawnSync("docker", [
      "images",
      "--filter",
      "reference=kipuka-*",
      "--format",
      "{{.Repository}}",
    ]);
    if (imageList.stdout) {
      const images = imageList.stdout
        .toString()
        .trim()
        .split("\n")
        .filter(Boolean);
      if (images.length > 0) {
        console.log(
          `Found ${images.length} kipuka images: ${images.join(", ")}`
        );
        for (const image of images) {
          await executeDockerCommand(["rmi", image], `Remove image ${image}`);
        }
      } else {
        console.log("No kipuka images found");
      }
    } else {
      console.log("Empty output from docker images.");
    }
  },
  async init() {
    if (!existsSync(globalConfigDir)) {
      await mkdir(globalConfigDir, { recursive: true });
      const dotFolder = join(import.meta.dirname, "..", "dot");
      if (!existsSync(dotFolder)) {
        throw new Error(
          `Config template missing from package. Expected to find it here: '${dotFolder}'`
        );
      }

      await cp(dotFolder, globalConfigDir, {
        recursive: true,
      });

      console.log(`Created global config at ${globalConfigDir}`);
      console.log(
        `Linking @lavamoat/kipuka to ${globalConfigDir} as a dependency`
      );

      const linkResult = spawnSync("npm", ["link", "@lavamoat/kipuka"], {
        cwd: globalConfigDir,
        stdio: "inherit",
      });

      if (linkResult.status !== 0) {
        console.error(
          "Failed to link kipuka package. You may need to do it manually."
        );
      }
    } else {
      console.log("~/.kipuka directory already exists");
    }
  },
  async alias(options = {}) {
    const config = await readGlobalConfig();
    let aliases;
    if (options.set) {
      aliases = options.set.split(",");
    } else {
      aliases = config.aliases || [];
    }

    if (aliases.length === 0) {
      console.log("No aliases specified", config);
    }

    const use = options.use || "cli";

    for (const alias of aliases) {
      const aliasLine = `${alias}='kipuka ${use} --k-wrap-cli=${alias}'`;
      console.log(`alias ${aliasLine}`);
      spawnSync("alias", [aliasLine], {
        stdio: "inherit",
        shell: true,
      });
    }
  },
  async help() {
    console.error("Usage:");
    console.error("kipuka-ctl <command> - execute one of the commands");
    console.error("Available commands:", Object.keys(commands).join(", "));
    process.exit(1);
  },
};

const { positionals, values } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    use: { type: "string" },
    set: { type: "string" },
  },
  strict: false,
});

let command = positionals[0];
await commands[command || "help"](values);
