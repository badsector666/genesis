import { expect } from "chai";
import lodash from "lodash";
import { describe, it } from "mocha";

import { botObject } from "configs/bot.config";
import { getObjectId } from "helpers/inputs";
import * as network from "helpers/network";


describe("network.ts", () => {
    describe("checkNetwork()", () => {
        it("should return true", async () => {
            expect(await network.checkNetwork(false))
                .to.be.true;
        });

        it("should return false", async () => {
            expect(await network.checkNetwork(true))
                .to.be.false;
        });
    });

    describe("connectToDB()", () => {
        it("should return the MongoDB database", async () => {
            expect(await network.connectToDB(true, "tests"))
                .is.a("object");
        });

        it("should return null", async () => {
            expect(await network.connectToDB(true, "tests"))
                .is.null;
        });
    });

    describe.only("getBotObjectFromDB()", () => {
        it("should return the bot object", async () => {
            const { mongoDB } = await network.connectToDB(true, "tests");
            if (mongoDB !== null) {
                const testBotObject = lodash.cloneDeep(botObject);
                const sandbox = true;
                const botName = "Timothé";

                testBotObject.start.name = botName;
                testBotObject.start.id = getObjectId(sandbox, testBotObject.start.name);
                testBotObject.start.sandbox = sandbox;

                const sendOrGet = network.sendOrGetInitialBotObject(mongoDB, testBotObject);

                expect((await sendOrGet).start.name)
                    .is.equal(botName);
            }
        });
    });
});

describe("sendOrGetInitialBotObject()", () => {
    it("should return the name of the bot", async () => {
        const { mongoDB } = await network.connectToDB(true, "tests");

        if (mongoDB !== null) {
            const testBotObject = lodash.cloneDeep(botObject);
            const sandbox = true;
            const botName = "timmy";

            testBotObject.start.name = botName;
            testBotObject.start.id = getObjectId(sandbox, testBotObject.start.name);
            testBotObject.start.sandbox = sandbox;

            const sendOrGet = network.sendOrGetInitialBotObject(mongoDB, testBotObject);

            expect((await sendOrGet).start.name)
                .is.equal(botName);
        }
    });

    it("should return the same bot object", async () => {
        const { mongoDB } = await network.connectToDB(true, "tests");

        if (mongoDB !== null) {
            const testBotObject = lodash.cloneDeep(botObject);
            const sandbox = true;
            const botName = "timmy";

            testBotObject.start.name = botName;
            testBotObject.start.id = getObjectId(sandbox, testBotObject.start.name);
            testBotObject.start.sandbox = sandbox;

            const sendOrGet = network.sendOrGetInitialBotObject(mongoDB, testBotObject);

            expect((await sendOrGet).start.name)
                .is.equal(botName);
        }
    });
});