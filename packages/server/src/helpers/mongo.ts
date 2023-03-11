import { Db, MongoClient } from "mongodb";

import logger from "helpers/logger";


/**
 * Connect to MongoDB.
 * @param fatal If the connection fails, should the application exit?
 * @returns The MongoDB database.
 */
export default async function connectToDB(fatal = true): Promise<Db | null> {
    const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}`;
    const mongoClient = new MongoClient(uri, {});

    try {
        await mongoClient.connect();
        const mongoDB = mongoClient.db(process.env.MONGODB_DB);

        logger.info(`Successfully connected to the MongoDB database [${process.env.MONGODB_DB}].`);

        return mongoDB;
    } catch (error) {
        logger.error(`Error while connecting to MongoDB: ${error}.`);

        if (fatal) {
            process.exit(1);
        } else {
            return null;
        }
    }
}