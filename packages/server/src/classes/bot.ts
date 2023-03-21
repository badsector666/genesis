import ccxt from "ccxt";
import { Db } from "mongodb";

import { botObject } from "configs/defaults.config";
import { EXCHANGE_CONFIG, GENERAL_CONFIG } from "configs/global.config";
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
import {
    getCurrentDateString,
    getObjectId,
    getTimeframe,
    getUserInput
} from "helpers/inputs";
import {
    checkNetwork,
    closeDBConnection,
    connectToDB,
    sendBotObjectCategory,
    sendOrGetInitialBotObject
} from "helpers/network";
import NsBot from "types/bot";
import logger from "utils/logger";


export default class Bot {
    private _botObject = botObject;
    private _mongoDB: NsBot.IsMongoDB = {
        mongoClient: null,
        mongoDB: null
    };


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

        // Bot static parameters
        this._botObject.started.name = name;
        this._botObject.started.id = getObjectId(sandbox, name);
        this._botObject.started.sandbox = sandbox;

        // Trading pair
        const tokens = parseTradingPair(tradingPair);
        this._botObject.started.tradingPair = tradingPair;
        this._botObject.started.baseCurrency = tokens.base;
        this._botObject.started.quoteCurrency = tokens.quote;
        this._botObject.started.initialQuoteBalance = initialQuoteBalance;

        // Timestamps
        this._botObject.started.timeframe = getTimeframe(timeframe);

        // Logging
        logger.info(`New "${name}" bot instance for ${tradingPair} created.`);
        logger.info(`Sandbox mode: ${sandbox ? "enabled" : "disabled"}`);
        logger.info(`Initial quote balance: ${initialQuoteBalance} ${tradingPair.split("/")[1]}`);
        logger.info(`Timeframe: ${timeframe}`);

        // Initialize the bot
        this._botObject.local.initialized = this._initialize();
    }


    /**
     * Initialize the bot.
     */
    private async _initialize() {
        // Real mode warning with user input (FATAL)
        if (!this._botObject.started.sandbox) {
            const answer = await getUserInput(
                "Sandbox mode is disabled! Would you like to continue? (y/n)"
            );

            if (answer !== "y") {
                logger.info("Exiting...");
                process.exit(0);
            }
        }

        // Check the network (FATAL)
        if (!this._botObject.started.sandbox) {
            this._botObject.local.networkCheck = await checkNetwork();
        } else {
            logger.info("Skipping network check in sandbox mode...");
            this._botObject.local.networkCheck = true;
        }

        if (this._botObject.local.networkCheck) {
            // Connect to MongoDB (FATAL)
            this._mongoDB = await connectToDB();

            // Load the exchange
            this._botObject.local.exchange = loadExchange(this._botObject.started.sandbox);

            // Check the exchange status (FATAL)
            // Endpoint not available in sandbox mode
            await checkExchangeStatus(this._botObject.local.exchange);

            // Load the markets
            await loadMarkets(this._botObject.local.exchange);

            // Local/Exchange time difference
            this._botObject.specials.timeDifference = await exchangeTimeDifference(
                this._botObject.local.exchange
            );

            // Load the balances
            this._botObject.local.balances = await loadBalances(
                this._botObject.local.exchange
            );

            // Get the balances
            this._botObject.started.baseBalance = getBalance(
                this._botObject.local.balances,
                this._botObject.started.baseCurrency
            );

            this._botObject.started.quoteBalance = getBalance(
                this._botObject.local.balances,
                this._botObject.started.quoteCurrency
            );

            // Check the balances
            if (this._botObject.started.baseBalance === null) {
                logger.error(`The base currency ${this._botObject.started.baseCurrency} is not available!`);
                process.exit(1);
            }

            if (this._botObject.started.quoteBalance === null) {
                logger.error(`The quote currency ${this._botObject.started.quoteCurrency} is not available!`);
                process.exit(1);
            }

            // Send or get the initial bot object
            this._botObject = await sendOrGetInitialBotObject(
                this._mongoDB.mongoDB as Db,
                this._botObject
            );
        } else {
            logger.error("Network is not reliable, cannot connect to MongoDB!");
            process.exit(1);
        }
    }

    /**
     * General loop of the bot (no precision corrector).
     * Used for the statistics update and other data collections.
     */
    private async _generalLoop() {
        while (this._botObject.local.running) {
            if (this._mongoDB.mongoDB) {
                this._botObject.specials.timeDifference = await exchangeTimeDifference(
                    this._botObject.local.exchange as ccxt.Exchange
                );
            }

            // General statistics update
            this._botObject.stats.generalIterations += 1;

            // Update the statistics
            if (this._mongoDB.mongoDB) {
                sendBotObjectCategory(this._mongoDB.mongoDB as Db, this._botObject, "stats");
            }

            await new Promise(resolve => setTimeout(
                resolve,
                this._botObject.started.timeframe * GENERAL_CONFIG.timeframeFactorForGeneralLoop
            ));
        }
    }

    /**
     * The main loop of the bot.
     */
    private async _mainLoop() {
        while (this._botObject.local.running) {
            let timeframeCorrector = performance.now();

            // MAIN CODE HERE

            timeframeCorrector = performance.now() - timeframeCorrector;

            // Statistics
            this._botObject.stats.mainIterations += 1;

            // Handle main time frame corrector special
            this._botObject.specials.mainTimeframeCorrector = parseFloat(timeframeCorrector.toFixed(4));

            const delay = parseFloat(
                (this._botObject.started.timeframe - timeframeCorrector).toFixed(4)
            );

            await new Promise(resolve => setTimeout(
                resolve,
                delay
            ));
        }
    }

    /**
     * Start the bot.
     */
    public async start() {
        // Await the initialization
        await this._botObject.local.initialized;

        // Main Loop
        this._botObject.local.running = true;

        // Updates the last start time
        this._botObject.started.lastStartTime = getCurrentDateString();

        // Update the statistics
        sendBotObjectCategory(this._mongoDB.mongoDB as Db, this._botObject, "started");

        await Promise.all([
            this._generalLoop(),
            this._mainLoop()
        ]);
    }

    /**
     * Stop the bot.
     */
    public async stop() {
        // Await the initialization
        await this._botObject.local.initialized;

        // Stop the bot
        this._botObject.local.running = false;

        // Update the statistics
        this._botObject.stopped.lastStopTime = getCurrentDateString();

        if (this._mongoDB.mongoDB) {
            // Also sends the stats from the last iterations (in case of general loop delay)
            await sendBotObjectCategory(this._mongoDB.mongoDB as Db, this._botObject, "stats");
            await sendBotObjectCategory(this._mongoDB.mongoDB as Db, this._botObject, "stopped");

            // Close the MongoDB connection
            if (this._mongoDB && this._mongoDB.mongoClient) {
                await closeDBConnection(this._mongoDB.mongoClient);
            }
        }

        // Log the bot stop
        logger.info("Bot stopped.");
    }
}