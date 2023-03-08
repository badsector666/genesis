import { MongoClient } from "mongodb";


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}`;

const mongoClient = new MongoClient(uri, {});
const mongoDB = mongoClient.db(process.env.MONGODB_DB);


export {
    mongoClient,
    mongoDB
};