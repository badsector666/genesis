import { expect } from "chai";
import { describe, it } from "mocha";

import { getObjectId, sha256 } from "../helpers/inputs";


describe("inputs.ts", () => {
    describe("sha256()", () => {
        it("Should encode a string to sha256 truncated to 24 character.", function () {
            expect(sha256("Bobby").length).is.equal(24);
        });
    });

    describe("getObjectId()", () => {
        it("Should give the MongoDB object ID from the bot name.", function () {
            expect(getObjectId(true, "Rompish")).is.a.key;
        });
    });
});