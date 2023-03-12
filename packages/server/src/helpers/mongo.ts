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
        logger.error(`Error while connecting to MongoDB:\n${error}.`);

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

        logger.info("Successfully closed MongoDB connection.");
    } catch (error) {
        logger.error(`Error while closing MongoDB connection:\n${error}.`);
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
    } catch (error) {
        logger.error(`Error while sending statistics to MongoDB:\n${error}.`);
    }
}

/**
 * Main statistics function for the MongoDB database,
 * verifies if the identifier already exists, if it's the case,
 * it returns the statistics, otherwise it sends the new ones to the database.
 * @param mongoDB The MongoDB database.
 * @param statistics The statistics.
 * @returns The statistics.
 */
export async function statistics(mongoDB: Db, statistics: NsBot.IsStatistics) {
    try {
        const result = await mongoDB.collection("statistics").findOne({
            _id: ObjectId.createFromHexString(statistics._id)
        });

        if (result) {
            logger.info("Statistics recovered from MongoDB.");

            return {
                ...result,
                _id: result._id.toString(),
            };
        } else {
            logger.info("Statistics do not exist in MongoDB, sending them.");
            await sendStatistics(mongoDB, statistics);

            return statistics;
        }
    } catch (error) {
        logger.error(`Error while getting statistics from MongoDB:\n${error}.`);
        return statistics;
    }
}