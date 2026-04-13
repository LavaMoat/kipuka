#!/usr/bin/env node
import { basename, join } from "path";
import { start, kipuka } from "../framework/index.js";
import { consumeHeadArg } from "../framework/internal.js";
import { globalConfigDir, readGlobalConfig } from "../framework/conf.js";

await readGlobalConfig();

async function runKipuka(name) {
  if (!name) {
    return start(kipuka);
  }
  const location = join(globalConfigDir, basename(name + ".js"));

  let choice;
  try {
    choice = (await import(location)).default;
  } catch (e) {
    throw Error(`No kipuka definition under '${location}`, { cause: e });
  }
  if (!choice || !Array.isArray(choice)) {
    throw Error(`Failed to get a kipuka from ${location}`);
  }
  start(choice);
}

let name = consumeHeadArg();
if (!name || name == "--") {
  runKipuka();
} else {
  runKipuka(name);
}
