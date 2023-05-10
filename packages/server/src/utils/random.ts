/**
 * Generates a random bot name for the tests/development.
 * @param length The length of the bot name (defaults to 16).
 * @returns The random bot name.
 */
export function generateRandomBotName(length = 16) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const charactersLength = characters.length;
    let result = "";

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}