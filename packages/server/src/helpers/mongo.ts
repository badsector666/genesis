import { MongoClient } from "mongodb";


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}`;

/**
 * MongoDB client.
 */
const mongoClient = new MongoClient(uri, {});

/**
 * MongoDB database (linked to the env file).
 */
const mongoDB = mongoClient.db(process.env.MONGODB_DB);


export {
    mongoClient,
    mongoDB
};