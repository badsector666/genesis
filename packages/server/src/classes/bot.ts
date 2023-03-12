import date from "date-and-time";

import { EXCHANGE_CONFIG } from "configs/global.config";
import * as exchangeWrapper from "helpers/exchange";
import * as inputsWrapper from "helpers/inputs";
import logger from "helpers/logger";
import { sha256 } from "helpers/maths";
import * as mongoWrapper from "helpers/mongo";
import * as networkWrapper from "helpers/network";
import NsBot from "types/bot";


export default class Bot {
    // Local Vars
    private _networkStatus = false;
    private _mongoDB: NsBot.IsMongoDB = {
        mongoClient: null,
        mongoDB: null
    };

    // Interfaces
    private _exchangeData: NsBot.IsExchangeData = {
        // Raw exchange obj and balances from ccxt
        _exchange: null,
        _balances: null
    };

    private _statistics: NsBot.IsStatistics = {
        _id: "",
        _initTime: "",
        _tradingCount: 0,
        _isSandBox: false,
        _tradingPair: "",
        _initialQuoteBalance: 0,
        _totalProfit: 0
    };

    private _botData: NsBot.IsBotData = {
        // Sandbox mode
        _isSandBox: false,

        // Trading pair
        _tradingPair: "",

        // Currencies
        _baseCurrency: "",
        _baseBalance: null,
        _quoteCurrency: "",
        _quoteBalance: null,
        _initialQuoteBalance: 0,
        _totalProfit: 0,

        // Sync with Binance server time
        _timeDifference: 0
    };


    /**
     * Create a new bot.
     * @param tradingPair The trading pair (overridden in sandbox mode).
     * @param identifier The bot identifier (used for statistics).
     * @param sandbox If the bot should run in sandbox mode.
     * @param initialQuoteBalance The initial quote balance to start with.
     */
    constructor(
        tradingPair: string,
        identifier: string,
        sandbox = true,
        initialQuoteBalance = 0
    ) {
        this._botData._isSandBox = sandbox;
        this._botData._initialQuoteBalance = initialQuoteBalance;

        // Sandbox mode overrides the trading pair
        // As most of currencies are not available in sandbox mode
        if (sandbox) {
            tradingPair = EXCHANGE_CONFIG.sandboxTradingPair;
        }

        // Set the trading pair
        this._botData._tradingPair = tradingPair;
        logger.info(`New bot for ${tradingPair} created.`);

        // Parse the trading pair
        const tokens = exchangeWrapper.parseTradingPair(tradingPair);
        this._botData._baseCurrency = tokens.base;
        this._botData._quoteCurrency = tokens.quote;

        (async () => {
            if (!sandbox) {
                const answer = await inputsWrapper.getUserInput(
                    "Sandbox mode is disabled! Would you like to continue? (y/n)"
                );

                if (answer !== "y") {
                    logger.info("Exiting...");
                    process.exit(0);
                }
            }

            // Check the network status (FATAL)
            if (!sandbox) {
                this._networkStatus = await networkWrapper.checkNetwork();
            } else {
                logger.info("Skipping network check in sandbox mode...");
                this._networkStatus = true;
            }

            if (this._networkStatus) {
                // Connect to MongoDB (FATAL)
                this._mongoDB = await mongoWrapper.connectToDB();

                // Load the exchange
                this._exchangeData._exchange = exchangeWrapper.loadExchange(sandbox);

                // Check the exchange status (FATAL)
                // Endpoint not available in sandbox mode
                await exchangeWrapper.checkExchangeStatus(this._exchangeData._exchange);

                // Load the markets
                await exchangeWrapper.loadMarkets(this._exchangeData._exchange);

                // Local/Exchange time difference
                this._botData._timeDifference = await exchangeWrapper.exchangeTimeDifference(
                    this._exchangeData._exchange
                );

                // Load the balances
                this._exchangeData._balances = await exchangeWrapper.loadBalances(
                    this._exchangeData._exchange
                );

                // Get the balances
                this._botData._baseBalance = exchangeWrapper.getBalance(
                    this._exchangeData._balances,
                    this._botData._baseCurrency
                );

                this._botData._quoteBalance = exchangeWrapper.getBalance(
                    this._exchangeData._balances,
                    this._botData._quoteCurrency
                );

                // Check the balances
                if (this._botData._baseBalance === null) {
                    logger.error(`The base currency ${this._botData._baseCurrency} is not available!`);
                    process.exit(1);
                }

                if (this._botData._quoteBalance === null) {
                    logger.error(`The quote currency ${this._botData._quoteCurrency} is not available!`);
                    process.exit(1);
                }

                // Sends the statistics to MongoDB
                if (this._mongoDB.mongoDB) {
                    const identifierHash = sha256(
                        sandbox ? `${identifier}-sandbox` : identifier
                    );

                    // Set the statistics static data
                    this._statistics._id = identifierHash;
                    this._statistics._initTime = date.format(new Date(), "YYYY-MM-DD HH:mm:ss");
                    this._statistics._isSandBox = sandbox;
                    this._statistics._tradingPair = tradingPair;
                    this._statistics._initialQuoteBalance = initialQuoteBalance;

                    // Override these data if already in the database
                    const statistics = await mongoWrapper.statistics(
                        this._mongoDB.mongoDB,
                        this._statistics
                    ) as NsBot.IsStatistics;

                    console.log(statistics);
                }
            } else {
                logger.error("Network is not reliable, cannot connect to MongoDB!");
                process.exit(1);
            }
        })();
    }

    /**
     * Close the MongoDB connection.
     */
    public closeMongoDB() {
        if (this._mongoDB && this._mongoDB.mongoClient) {
            mongoWrapper.closeDBConnection(this._mongoDB.mongoClient);
        }
    }
}