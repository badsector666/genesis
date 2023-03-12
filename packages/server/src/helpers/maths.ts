import crypto from "crypto";


/**
 * Encode a string to sha256 truncated to 24 character.
 * @param input The input string.
 * @returns The sha256 encoded string.
 */
export function sha256(input: string) {
    const hash = crypto.createHash("sha256").update(input).digest("hex");
    return hash.substring(0, 24);
}