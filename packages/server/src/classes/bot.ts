import ccxt from "ccxt";
import { Db } from "mongodb";

import {
    checkExchangeStatus,
    exchangeTimeDifference,
    loadExchange,
    loadMarkets
} from "helpers/exchange";
import logger from "helpers/logger";
import connectToDB from "helpers/mongo";
import checkNetwork from "helpers/network";


export default class Bot {
    // Exchange and MongoDB
    private _exchange: ccxt.Exchange | null = null;
    private _mongoDB: Db | null = null;

    // Statuses
    private _networkStatus = false;
    private _exchangeStatus = false;

    private _buyLimit = 0;
    private _sellLimit = 0;

    private _buyPrice = 0;
    private _sellPrice = 0;

    private _estimatedFee = 0;

    private _timeDifference = 0;

    private _tradingPair: string;


    constructor(
        tradingPair: string,
        sandbox = true
    ) {
        this._tradingPair = tradingPair;

        logger.info(`New bot for ${tradingPair} created.`);

        if (!sandbox) {
            logger.warn("Sandbox mode is disabled! Would you like to continue? (y/n)");
            // TODO: Ask the user if he wants to continue
        }

        (async () => {
            // Check the network status (FATAL)
            if (!sandbox) {
                this._networkStatus = await checkNetwork();
            } else {
                this._networkStatus = true;
            }

            if (this._networkStatus) {
                // Connect to MongoDB (FATAL)
                this._mongoDB = await connectToDB();

                // Load the exchange
                this._exchange = loadExchange(sandbox);

                // Check the exchange status (FATAL)
                // Endpoint not available in sandbox mode
                await checkExchangeStatus(this._exchange);

                // Load the markets
                await loadMarkets(this._exchange);

                // Local/Exchange time difference
                this._timeDifference = await exchangeTimeDifference(this._exchange);
            } else {
                logger.error("Network is not reliable, cannot connect to MongoDB!");
                process.exit(1);
            }
        })();
    }

    // loadExchange
    // checkExchangeStatus
    // loadMarkets
    // loadBalance
}