import date from "date-and-time";
import { Db, MongoClient, ObjectId } from "mongodb";
import speedTest from "speedtest-net";

import { NETWORK_CONFIG } from "configs/global.config";
import NsBotStats from "types/botStats";
import logger from "utils/logger";


/**
 * Check network reliability.
 * @param fatal If the network is not reliable, should the application exit? (default: true)
 * @returns True if test passed.
 */
export async function checkNetwork(fatal = true): Promise<boolean> {
    let networkResult = null;

    logger.info("Getting network data for reliability check...");

    try {
        networkResult = await speedTest({
            acceptLicense: true,
            acceptGdpr: true
        });
    } catch (err) {
        logger.error("Network reliability check error:", err);

        if (fatal) {
            process.exit(1);
        } else {
            return false;
        }
    }

    if (networkResult !== null) {
        // Convert the bandwidths to Mo/s
        const download = networkResult.download.bandwidth / 1024 / 1024;
        const upload = networkResult.upload.bandwidth / 1024 / 1024;

        const result = {
            jitter: networkResult.ping.jitter,
            latency: networkResult.ping.latency,
            download: download.toFixed(3),
            upload: upload.toFixed(3)
        };

        const stringRes = `D: ${result.download} Mo/s, U: ${result.upload} Mo/s, L: ${result.latency} ms, J: ${result.jitter} ms`;

        let testPassed = true;

        if (result.jitter > NETWORK_CONFIG.jitterLimit) {
            logger.error(`Network jitter is too high [${result.jitter} ms].`);
            testPassed = false;
        }

        if (result.latency > NETWORK_CONFIG.latencyLimit) {
            logger.error(`Network latency is too high [${result.latency} ms].`);
            testPassed = false;
        }

        if (download < NETWORK_CONFIG.downloadLimit) {
            logger.error(`Network download speed is too low [${result.download} Mo/s].`);
            testPassed = false;
        }

        if (upload < NETWORK_CONFIG.uploadLimit) {
            logger.error(`Network upload speed is too low [${result.upload} Mo/s].`);
            testPassed = false;
        }

        if (testPassed) {
            logger.info(`Network reliability check passed [${stringRes}].`);

            return true;
        } else {
            logger.error("Network reliability check failed.");

            if (fatal) {
                process.exit(1);
            } else {
                return false;
            }
        }
    } else {
        logger.error("Network reliability check failed.");

        if (fatal) {
            process.exit(1);
        } else {
            return false;
        }
    }
}


/**
 * Connect to MongoDB.
 * @param fatal If the connection fails, should the application exit? (default: true)
 * @returns The MongoDB database.
 */
export async function connectToDB(fatal = true) {
    const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}`;
    const mongoClient = new MongoClient(uri, {});

    try {
        await mongoClient.connect();
        const mongoDB = mongoClient.db(process.env.MONGODB_DB);

        logger.info(`Successfully connected to the MongoDB database [${process.env.MONGODB_DB}].`);

        return {
            mongoClient: mongoClient,
            mongoDB: mongoDB
        };
    } catch (error) {
        logger.error(`Error while connecting to the MongoDB database:\n${error}.`);

        if (fatal) {
            process.exit(1);
        } else {
            return {
                mongoClient: null,
                mongoDB: null
            };
        }
    }
}

/**
 * Close the MongoDB connection.
 * @param mongoClient The MongoDB client.
 */
export async function closeDBConnection(mongoClient: MongoClient) {
    try {
        if (mongoClient !== null) {
            await mongoClient.close();
        }

        logger.verbose("Successfully closed the database connection.");
    } catch (error) {
        logger.error(`Error while closing the database connection:\n${error}.`);
    }
}

/**
 * Check if the statistics already exist in the database.
 * @param mongoDB The MongoDB database.
 * @param mongoIdentifier The bot identifier (objectID from MongoDB).
 * @returns If the statistics exist.
 */
export async function checkStatistics(mongoDB: Db, mongoIdentifier: string) {
    try {
        const result = await mongoDB.collection("statistics").findOne({
            _id: ObjectId.createFromHexString(mongoIdentifier)
        });

        if (result) {
            logger.verbose("Statistics for this bot found inside the database.");

            return true;
        } else {
            logger.verbose("Statistics for this bot do not exist inside the database.");

            return false;
        }
    } catch (error) {
        logger.error(`Error while checking statistics from the database:\n${error}.`);
        return false;
    }
}

/**
 * Send statistics to the MongoDB database.
 * @param mongoDB The MongoDB database.
 * @param statistics The statistics.
 */
export async function sendStatistics(mongoDB: Db, statistics: NsBotStats.IsBotStats) {
    try {
        await mongoDB.collection("statistics").insertOne({
            ...statistics,
            _id: new ObjectId(statistics._id)
        });

        logger.verbose("Statistics sent to the database.");
    } catch (error) {
        logger.error(`Error while sending statistics to the database:\n${error}.`);
    }
}

/**
 * Update the statistics inside the MongoDB database.
 * @param mongoDB The MongoDB database.
 * @param statistics The statistics.
 * @param update If the statistics should be updated.
 */
export async function updateStatistics(mongoDB: Db, statistics: NsBotStats.IsBotStats) {
    try {
        const {
            _id,
            _timestamps,
            ...updateFields
        } = statistics;

        // Update the last update timestamp
        _timestamps._lastStatsUpdate = date.format(new Date(), "YYYY-MM-DD HH:mm:ss");

        await mongoDB.collection("statistics").updateOne(
            {
                _id: ObjectId.createFromHexString(_id)
            },
            {
                $set: {
                    ...updateFields,
                    _timestamps
                }
            }
        );

        logger.verbose("Statistics updated into the database.");
    } catch (error) {
        logger.error(`Error while updating statistics to database:\n${error}.`);
    }
}

/**
 * Get statistics from the MongoDB database.
 * @param mongoDB The MongoDB database.
 * @param mongoIdentifier The bot identifier (objectID from MongoDB).
 * @returns The statistics or null if not found.
 */
export async function getStatistics(
    mongoDB: Db,
    mongoIdentifier: string
): Promise<NsBotStats.IsBotStats | null> {
    try {
        const result = await mongoDB.collection("statistics").findOne({
            _id: ObjectId.createFromHexString(mongoIdentifier)
        });

        if (result) {
            logger.verbose("Statistics recovered from the database.");

            const _id = result._id.toString();

            const _botInfo = {
                ...result._botInfo
            } as NsBotStats.IsBotInfo;

            const _timestamps = {
                ...result._timestamps
            } as NsBotStats.IsTimestamps;

            const _botParams = {
                ...result._botParams
            } as NsBotStats.IsBotParams;

            const _tradeStats = {
                ...result._tradeStats
            } as NsBotStats.IsTradeStats;

            return {
                _id: _id,
                _botInfo: _botInfo,
                _timestamps: _timestamps,
                _botParams: _botParams,
                _tradeStats: _tradeStats
            } as NsBotStats.IsBotStats;
        } else {
            logger.error("Error while getting the statistics: Not found.");

            return null;
        }
    } catch (error) {
        logger.error(`Error while getting statistics from the database:\n${error}.`);
        return null;
    }
}