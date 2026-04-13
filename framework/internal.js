import { createInterface } from "node:readline";

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