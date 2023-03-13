import date from "date-and-time";
import { Db, MongoClient, ObjectId } from "mongodb";


import logger from "helpers/logger";
import NsBot from "types/bot";


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
 * @param sandbox If the statistics are from a sandbox.
 * @returns If the statistics exist.
 */
export async function checkStatistics(mongoDB: Db, mongoIdentifier: string, sandbox: boolean) {
    try {
        const result = await mongoDB.collection("statistics").findOne({
            _id: ObjectId.createFromHexString(mongoIdentifier),
            _isSandbox: sandbox
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
export async function sendStatistics(mongoDB: Db, statistics: NsBot.IsStatistics) {
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
export async function updateStatistics(mongoDB: Db, statistics: NsBot.IsStatistics) {
    try {
        const {
            _id,
            _isSandbox,
            ...updateFields
        } = statistics;

        await mongoDB.collection("statistics").updateOne(
            {
                _id: ObjectId.createFromHexString(_id),
                _isSandbox: _isSandbox
            },
            {
                $set: {
                    ...updateFields,
                    _lastStatsUpdate: date.format(new Date(), "YYYY-MM-DD HH:mm:ss")
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
 * @param isSandbox If the statistics are from a sandbox.
 * @returns The statistics or null if not found.
 */
export async function getStatistics(
    mongoDB: Db,
    mongoIdentifier: string,
    isSandbox: boolean
): Promise<NsBot.IsStatistics | null> {
    try {
        const result = await mongoDB.collection("statistics").findOne({
            _id: ObjectId.createFromHexString(mongoIdentifier),
            _isSandbox: isSandbox
        });

        if (result) {
            logger.verbose("Statistics recovered from the database.");

            return {
                ...result,
                _id: result._id.toString(),
            } as NsBot.IsStatistics;
        } else {
            logger.error("Error while getting the statistics: Not found.");

            return null;
        }
    } catch (error) {
        logger.error(`Error while getting statistics from the database:\n${error}.`);
        return null;
    }
}