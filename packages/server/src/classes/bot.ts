import ccxt from "ccxt";
import { Db } from "mongodb";

import { EXCHANGE_CONFIG } from "configs/global.config";
import * as exchangeWrapper from "helpers/exchange";
import { getUserInput } from "helpers/inputs";
import logger from "helpers/logger";
import connectToDB from "helpers/mongo";
import checkNetwork from "helpers/network";


export default class Bot {
    // Exchange
    private _exchange: ccxt.Exchange | null = null;
    private _balances: ccxt.Balances | null = null;
    private _tradingPair: string;
    private _timeDifference = 0;

    // Balances
    private _baseCurrency = "";
    private _baseBalance: ccxt.Balance | null = null;
    private _quoteCurrency = "";
    private _quoteBalance: ccxt.Balance | null = null;

    // MongoDB
    private _mongoDB: Db | null = null;

    // Status
    private _networkStatus = false;


    /**
     * Create a new bot.
     * @param tradingPair The trading pair (overridden in sandbox mode).
     * @param sandbox If the bot should run in sandbox mode.
     */
    constructor(
        tradingPair: string,
        sandbox = true
    ) {
        // Sandbox mode overrides the trading pair
        // As most of currencies are not available in sandbox mode
        if (sandbox) {
            tradingPair = EXCHANGE_CONFIG.sandboxTradingPair;
        }

        // Set the trading pair
        this._tradingPair = tradingPair;
        logger.info(`New bot for ${tradingPair} created.`);

        // Parse the trading pair
        const tokens = exchangeWrapper.parseTradingPair(tradingPair);
        this._baseCurrency = tokens.base;
        this._quoteCurrency = tokens.quote;

        (async () => {
            if (!sandbox) {
                logger.warn("Sandbox mode is disabled! Would you like to continue? (y/n)");
                const answer = await getUserInput("");

                if (answer !== "y") {
                    logger.info("Exiting...");
                    process.exit(0);
                } else {
                    logger.info("Continuing...");
                }
            }

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
                this._exchange = exchangeWrapper.loadExchange(sandbox);

                // Check the exchange status (FATAL)
                // Endpoint not available in sandbox mode
                await exchangeWrapper.checkExchangeStatus(this._exchange);

                // Load the markets
                await exchangeWrapper.loadMarkets(this._exchange);

                // Local/Exchange time difference
                this._timeDifference = await exchangeWrapper.exchangeTimeDifference(this._exchange);

                // Load the balances
                this._balances = await exchangeWrapper.loadBalances(this._exchange);

                // Get the balances
                this._baseBalance = exchangeWrapper.getBalance(this._balances, this._baseCurrency);
                this._quoteBalance = exchangeWrapper.getBalance(this._balances, this._quoteCurrency);

                // Check the balances
                if (this._baseBalance === null) {
                    logger.error(`The base currency ${this._baseCurrency} is not available!`);
                    process.exit(1);
                }

                if (this._quoteBalance === null) {
                    logger.error(`The quote currency ${this._quoteCurrency} is not available!`);
                    process.exit(1);
                }

                // TODO: Send bot data to mongoDB
            } else {
                logger.error("Network is not reliable, cannot connect to MongoDB!");
                process.exit(1);
            }
        })();
    }
}