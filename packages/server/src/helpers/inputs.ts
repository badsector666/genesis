import * as readline from "readline";

import logger from "helpers/logger";


/**
 * Asks the user for input and returns the answer.
 * @param question The question to ask the user.
 * @returns The answer.
 */
export function getUserInput(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        logger.warn(question);

        rl.question("", (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}