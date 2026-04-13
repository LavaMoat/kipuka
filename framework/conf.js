import { join } from "path";
import { homedir } from "os";
export const globalConfigDir = join(homedir(), ".kipuka");
const configPath = join(globalConfigDir, "kipuka.config.js");

/** @import {KipukasGlobalConfig} from './types' */

/**
 * @type {KipukasGlobalConfig | null}
 */
export let config = null;

export const readGlobalConfig = async () => {
  try {
    const namespace = await import(configPath);
    config = namespace.default || namespace;
  } catch (e) {}
  return config;
};
