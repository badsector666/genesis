import { Db } from "mongodb";

import logger from "helpers/logger";
import connectToDB from "helpers/mongo";
import checkNetwork from "helpers/network";



export default class Bot {
    private _mongoDB: Db | null = null;

    private _tradingPair: string;

    private _networkStatus = false;

    private _buyLimit = 0;
    private _sellLimit = 0;

    private _buyPrice = 0;
    private _sellPrice = 0;

    private _estimatedFee = 0;

    private _onlineTimestamp = 0;
    private _offlineTimestamp = 0;


    constructor(
        tradingPair: string,
        sandbox = false
    ) {
        this._tradingPair = tradingPair;

        // Log the creation of the bot
        logger.info(`New bot for ${tradingPair} created`);

        if (!sandbox) {
            // Check the network reliability (if not in sandbox mode)
            checkNetwork().then((networkStatus) => {
                this._networkStatus = networkStatus;
            }).then(() => {
                // Connect to MongoDB if the network is reliable
                if (this._networkStatus) {
                    connectToDB().then((mongoDB) => {
                        this._mongoDB = mongoDB;
                    });
                }
            });
        } else {
            // Connect to MongoDB without checking the network (if in sandbox mode)
            connectToDB().then((mongoDB) => {
                this._mongoDB = mongoDB;
            });
        }
    }
}