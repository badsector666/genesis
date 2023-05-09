import { expect } from "chai";
import lodash from "lodash";
import { describe, it } from "mocha";
import { Db } from "mongodb";

import { botObject } from "configs/bot.config";
import { getObjectId } from "helpers/inputs";
import * as network from "helpers/network";
import logger from "utils/logger";


// Silencing the logger
logger.transports.forEach((t) => (t.silent = true));


describe("network.ts", () => {
    describe("checkNetwork()", () => {
        it("Should return a boolean, depending if the network test has successfully passed or not", async () => {
            expect(await network.checkNetwork(false))
                .is.a("boolean");
        });
    });

    describe.only("connectToDB()", () => {
        let mongoDB: Db | null;

        beforeEach(async () => {
            // Assign the DB instance to the mongoDB variable
            ({ mongoDB } = await network.connectToDB(false, "tests"));
        });

        it("Should return 'null' if the connection fails (wrong database name)", async () => {
            const { mongoDB } = await network.connectToDB(false, "wrongDBName");

            expect(mongoDB, "MongoDB instance should be null")
                .is.null;
        });

        it("Should return the DB instance if connection is successful", async () => {
            if (mongoDB !== null) {
                expect(mongoDB)
                    .is.a("object");
            }
        });
    });

    describe("getBotObjectFromDB()", () => {
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