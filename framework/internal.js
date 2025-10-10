import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { createRequire } from "node:module";
import { createInterface } from "node:readline";

/** @import {KipukasGlobalConfig} from './types' */

/**
 * Prompts user for confirmation
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export const promptUser = (message) => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
};

/**
 * Consumes and returns the first positional argument from process.argv, removing it from the array
 * @returns {string|undefined} The first argument or undefined if none exists
 */
export const consumeHeadArg = () => {
  if (process.argv.length > 2) {
    return process.argv.splice(2, 1)[0];
  }
  return undefined;
};

export const globalConfigDir = join(homedir(), ".kipuka");

/**
 * Read the global config file
 * @returns {Promise<KipukasGlobalConfig>}
 */
export const readGlobalConfig = async () => {
  const configPath = join(globalConfigDir, "kipuka.config.js");

  if (!existsSync(configPath)) {
    throw Error('Config file not found. Run "kipukas init" first.');
  }

  try {
    const conf = await import(configPath);
    return conf.default || conf;
  } catch (error) {
    throw error;
  }
};
