import date from "date-and-time";
import { ObjectId } from "mongodb";

import { EXCHANGE_CONFIG } from "configs/global.config";
import {
} from "helpers/algorithm";
import {
    checkExchangeStatus,
    exchangeTimeDifference,
    getBalance,
    loadBalances,
    loadExchange,
    loadMarkets,
    parseTradingPair
} from "helpers/exchange";
import { getUserInput } from "helpers/inputs";
import logger from "helpers/logger";
import { sha256 } from "helpers/maths";
import {
    checkStatistics,
    closeDBConnection,
    connectToDB,
    getStatistics,
    sendStatistics,
    updateStatistics
} from "helpers/mongo";
import { checkNetwork } from "helpers/network";
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

    /**
     * Statistics.
     * Sent to the MongoDB database.
     *
     * Note that statistics should never be used as input for the bot,
     * but rather as a way to track the bot's performance.
     */
    private _statistics: NsBot.IsStatistics = {
        // Bot
        _id: "",                            // Bot identifier (MongoDB objectID)
        _name: "",                          // Bot name (used for statistics & converted to ObjectId)
        _isSandbox: false,                  // Sandbox mode

        // Timestamps
        _initTime: "",                      // First initialization time
        _lastInitTime: "",                  // Last initialization time
        _lastStopTime: "",                  // Last stop time
        _lastStatsUpdate: "",               // Last statistics update time

        // Trading Config
        _tradingPair: "",                   // Trading pair
        _initialQuoteBalance: 0,            // Initial quote balance to start with

        // General trading statistics
        _tradeSuccessRate: 0,               // Trade success rate (in %)
        _maxDrawdown: 0,                    // Maximum drawdown (max loss in %)
        _maxConsecutiveWins: 0,             // Maximum consecutive wins
        _maxConsecutiveLosses: 0,           // Maximum consecutive losses

        // Total trading statistics
        _totalTrades: 0,                    // Number of total trades
        _totalTradesWon: 0,                 // Number of total trades won
        _totalTradesLost: 0,                // Number of total trades lost
        _totalTradeVolume: 0,               // Total trade volume (in quote currency)
        _totalFees: 0,                      // Total fees (in quote currency)
        _totalProfit: 0,                    // Total profit (in quote currency)

        // Average trading statistics
        _avgTradeSize: 0,                   // Average trade size (in quote currency)
        _avgTradeDuration: 0,               // Average trade duration (in seconds)
        _avgTradeProfit: 0,                 // Average trade profit (in quote currency)
        _avgFeePerTrade: 0,                 // Average fee per trade (in quote currency)
        _avgDailyProfitPercentage: 0        // Average daily profit percentage (in %)
    };

    /**
     * Bot data.
     */
    private _botData: NsBot.IsBotData = {
        // Promise to wait for the bot to be initialized
        _initialized: new Promise<void>((resolved) => {
            resolved();
        }),

        _name: "",                          // Bot name (used for statistics & converted to ObjectId)
        _isSandbox: false,                  // Sandbox mode
        _tradingPair: "",                   // Trading pair
        _baseCurrency: "",                  // Base currency
        _baseBalance: null,                 // Base currency balance
        _quoteCurrency: "",                 // Quote currency
        _quoteBalance: null,                // Quote currency balance
        _initialQuoteBalance: 0,            // Initial quote balance
        _timeDifference: 0                  // Time difference between the exchange and the bot
    };


    /**
     * Create a new bot.
     * @param tradingPair The trading pair (overridden in sandbox mode).
     * @param name The bot name (used for statistics).
     * @param sandbox If the bot should run in sandbox mode.
     * @param initialQuoteBalance The initial quote balance to start with.
     */
    constructor(
        tradingPair: string,
        name: string,
        sandbox = true,
        initialQuoteBalance = 0
    ) {
        // Sandbox mode overrides the trading pair
        // As most of currencies are not available in sandbox mode
        if (sandbox) {
            tradingPair = EXCHANGE_CONFIG.sandboxTradingPair;
        }

        // Set the trading pair
        this._botData._tradingPair = tradingPair;
        logger.info(`New "${name}" bot instance for ${tradingPair} created.`);

        // Parse the trading pair
        const tokens = parseTradingPair(tradingPair);
        this._botData._baseCurrency = tokens.base;
        this._botData._quoteCurrency = tokens.quote;

        // Bot static parameters
        this._botData._name = name;
        this._botData._isSandbox = sandbox;
        this._botData._initialQuoteBalance = initialQuoteBalance;

        // Initialize the bot
        this._botData._initialized = this._initialize();
    }


    /**
     * Get the MongoDB object ID from the bot name.
     * @param sandbox If the bot is running in sandbox mode.
     * @param name The bot name.
     * @returns The MongoDB object ID.
     */
    private _getObjectId(sandbox: boolean, name: string) {
        const ID = sha256(
            sandbox ? `${name}-sandbox` : name
        );

        return ObjectId.createFromHexString(ID).toString("hex");
    }

    /**
     * Generate statistics if not found in MongoDB,
     * otherwise recover and update the local statistics.
     * @param sandbox If the bot is running in sandbox mode.
     * @param name The bot name.
     * @param tradingPair The trading pair.
     * @param initialQuoteBalance The initial quote balance.
     * @returns The statistics (local or from the database).
     */
    private async _statisticsHandler(
        sandbox: boolean,
        name: string,
        tradingPair: string,
        initialQuoteBalance: number
    ) {
        if (this._mongoDB.mongoDB) {
            const time = date.format(new Date(), "YYYY-MM-DD HH:mm:ss");
            const ID = this._getObjectId(sandbox, name);

            // Check if the statistics are already in the database
            const botStatisticsState = await checkStatistics(
                this._mongoDB.mongoDB,
                ID,
                sandbox
            );

            if (!botStatisticsState) {
                this._statistics._id = ID;
                this._statistics._name = name;
                this._statistics._initTime = time;
                this._statistics._lastInitTime = time;
                this._statistics._isSandbox = sandbox;
                this._statistics._tradingPair = tradingPair;
                this._statistics._initialQuoteBalance = initialQuoteBalance;

                await sendStatistics(this._mongoDB.mongoDB, this._statistics);
            } else {
                const tempStats = await getStatistics(this._mongoDB.mongoDB, ID, sandbox);

                if (tempStats) {
                    this._statistics = tempStats;
                }

                // Bypass the recovery from the database for certain statistics
                this._statistics._lastInitTime = time;
                this._statistics._initialQuoteBalance = initialQuoteBalance;
            }
        }
    }

    /**
     * Close the MongoDB connection.
     */
    private async _closeMongoDB() {
        if (this._mongoDB && this._mongoDB.mongoClient) {
            await closeDBConnection(this._mongoDB.mongoClient);
        }
    }

    /**
     * Initialize the bot.
     */
    private async _initialize() {
        // Non sandbox mode warning
        if (!this._botData._isSandbox) {
            const answer = await getUserInput(
                "Sandbox mode is disabled! Would you like to continue? (y/n)"
            );

            if (answer !== "y") {
                logger.info("Exiting...");
                process.exit(0);
            }
        }

        // Check the network status (FATAL)
        if (!this._botData._isSandbox) {
            this._networkStatus = await checkNetwork();
        } else {
            logger.info("Skipping network check in sandbox mode...");
            this._networkStatus = true;
        }

        if (this._networkStatus) {
            // Connect to MongoDB (FATAL)
            this._mongoDB = await connectToDB();

            // Load the exchange
            this._exchangeData._exchange = loadExchange(this._botData._isSandbox);

            // Check the exchange status (FATAL)
            // Endpoint not available in sandbox mode
            await checkExchangeStatus(this._exchangeData._exchange);

            // Load the markets
            await loadMarkets(this._exchangeData._exchange);

            // Local/Exchange time difference
            this._botData._timeDifference = await exchangeTimeDifference(
                this._exchangeData._exchange
            );

            // Load the balances
            this._exchangeData._balances = await loadBalances(
                this._exchangeData._exchange
            );

            // Get the balances
            this._botData._baseBalance = getBalance(
                this._exchangeData._balances,
                this._botData._baseCurrency
            );

            this._botData._quoteBalance = getBalance(
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

            // Statistics
            await this._statisticsHandler(
                this._botData._isSandbox,
                this._botData._name,
                this._botData._tradingPair,
                this._botData._initialQuoteBalance
            );
        } else {
            logger.error("Network is not reliable, cannot connect to MongoDB!");
            process.exit(1);
        }
    }

    /**
     * Start the bot.
     */
    public async start() {
        //
    }

    /**
     * Stop the bot.
     */
    public async stop() {
        // Await the initialization
        await this._botData._initialized;

        const time = date.format(new Date(), "YYYY-MM-DD HH:mm:ss");

        // Update the statistics
        this._statistics._lastStopTime = time;

        if (this._mongoDB.mongoDB) {
            await updateStatistics(this._mongoDB.mongoDB, this._statistics);
            await this._closeMongoDB();
        }

        // Log the bot stop
        logger.info("Bot stopped.");
    }
}