import date from "date-and-time";
import { ObjectId } from "mongodb";

import { botData, botStats } from "configs/defaults.config";
import { EXCHANGE_CONFIG } from "configs/global.config";
import {
} from "utils/algorithm";
import {
    checkExchangeStatus,
    exchangeTimeDifference,
    getBalance,
    loadBalances,
    loadExchange,
    loadMarkets,
    parseTradingPair
} from "helpers/exchange";
import { getTimeframe, getUserInput, sha256 } from "helpers/inputs";
import {
    checkNetwork,
    checkStatistics,
    closeDBConnection,
    connectToDB,
    getStatistics,
    sendStatistics,
    updateStatistics
} from "helpers/network";
import NsBot from "types/bot";
import NsBotStats from "types/botStats";
import logger from "utils/logger";


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
    private _statistics = botStats;

    /**
     * Bot data.
     */
    private _botData = botData;


    /**
     * Creates a new bot instance and initialize it
     *
     * @param tradingPair The trading pair (overridden in sandbox mode).
     * @param name The bot name (used for statistics).
     * @param sandbox If the bot should run in sandbox mode.
     * @param initialQuoteBalance The initial quote balance to start with.
     * @param timeframe The timeframe to use.
     * @returns The bot instance.
     */
    constructor(
        tradingPair: string,
        name: string,
        sandbox = true,
        initialQuoteBalance = 0,
        timeframe: "1s" | "30s" | "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "1d" = "1m"
    ) {
        // Sandbox mode overrides the trading pair
        // As most of currencies are not available in sandbox mode
        if (sandbox) {
            tradingPair = EXCHANGE_CONFIG.sandboxTradingPair;
        }

        // Set the trading pair
        this._botData._tradingPair = tradingPair;
        logger.info(`New "${name}" bot instance for ${tradingPair} created.`);
        logger.info(`Sandbox mode: ${sandbox ? "enabled" : "disabled"}`);
        logger.info(`Initial quote balance: ${initialQuoteBalance} ${tradingPair.split("/")[ 1 ]}`);
        logger.info(`Timeframe: ${timeframe}`);

        // Parse the trading pair
        const tokens = parseTradingPair(tradingPair);
        this._botData._baseCurrency = tokens.base;
        this._botData._quoteCurrency = tokens.quote;

        // Bot static parameters
        this._botData._name = name;
        this._botData._sandbox = sandbox;
        this._botData._initialQuoteBalance = initialQuoteBalance;
        this._botData._timeframe = getTimeframe(timeframe);

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
     * @returns The statistics (local or from the database).
     */
    private async _statisticsHandler() {
        if (this._mongoDB.mongoDB) {
            const time = date.format(new Date(), "YYYY-MM-DD HH:mm:ss");
            const ID = this._getObjectId(this._botData._sandbox, this._botData._name);

            // Check if the statistics are already in the database
            const botStatisticsState = await checkStatistics(this._mongoDB.mongoDB, ID);

            if (!botStatisticsState) {
                this._statistics._id = ID;
                this._statistics._botInfo._name = this._botData._name;
                this._statistics._botInfo._sandbox = this._botData._sandbox;

                this._statistics._timestamps._initTime = time;
                this._statistics._timestamps._lastStartTime = time;

                this._statistics._botParams._timeframe = this._botData._timeframe;
                this._statistics._botParams._tradingPair = this._botData._tradingPair;
                this._statistics._botParams._initialQuoteBalance = this._botData._initialQuoteBalance;

                await sendStatistics(this._mongoDB.mongoDB, this._statistics);
            } else {
                const tempStats = await getStatistics(this._mongoDB.mongoDB, ID);

                if (tempStats) {
                    this._statistics = tempStats;
                }

                // Bypass the recovery from the database for certain statistics
                this._statistics._timestamps._lastStartTime = time;
                this._statistics._botParams._initialQuoteBalance = this._botData._initialQuoteBalance;
                this._statistics._botParams._timeframe = this._botData._timeframe;
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
        // Real mode warning with user input (FATAL)
        if (!this._botData._sandbox) {
            const answer = await getUserInput(
                "Sandbox mode is disabled! Would you like to continue? (y/n)"
            );

            if (answer !== "y") {
                logger.info("Exiting...");
                process.exit(0);
            }
        }

        // Check the network status (FATAL)
        if (!this._botData._sandbox) {
            this._networkStatus = await checkNetwork();
        } else {
            logger.info("Skipping network check in sandbox mode...");
            this._networkStatus = true;
        }

        if (this._networkStatus) {
            // Connect to MongoDB (FATAL)
            this._mongoDB = await connectToDB();

            // Load the exchange
            this._exchangeData._exchange = loadExchange(this._botData._sandbox);

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
            await this._statisticsHandler();
        } else {
            logger.error("Network is not reliable, cannot connect to MongoDB!");
            process.exit(1);
        }
    }

    /**
     * The main loop of the bot.
     */
    private async _mainLoop() {
        while (this._botData._running) {
            console.log("test");

            await new Promise(resolve => setTimeout(
                resolve,
                1000
            ));
        }
    }

    /**
     * Start the bot.
     */
    public async start() {
        // Await the initialization
        await this._botData._initialized;

        // Main Loop
        this._botData._running = true;

        await Promise.all([
            this._mainLoop()
        ]);
    }

    /**
     * Stop the bot.
     */
    public async stop() {
        // Await the initialization
        await this._botData._initialized;

        const time = date.format(new Date(), "YYYY-MM-DD HH:mm:ss");

        // Update the statistics
        this._statistics._timestamps._lastStopTime = time;

        if (this._mongoDB.mongoDB) {
            await updateStatistics(this._mongoDB.mongoDB, this._statistics);
            await this._closeMongoDB();
        }

        this._botData._running = false;

        // Log the bot stop
        logger.info("Bot stopped.");
    }
}