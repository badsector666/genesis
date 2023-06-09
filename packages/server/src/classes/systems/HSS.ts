import lodash from "lodash";

import Cache from "classes/cache";
import { Strategy } from "classes/strategies";
import { botObject } from "configs/botObject.config";
import {
    checkExchangeStatus,
    exchangeTimeDifference,
    getBalance,
    loadBalances,
    loadExchange,
    loadMarkets,
    parseTradingPair
} from "helpers/exchange";
import { getCurrentDateString, getTimeframe } from "helpers/inputs";
import NsGeneral from "types/general";
import logger from "utils/logger";


/**
 * Historical Scoring System (HSS)
 * Reproduces the bot behavior on historical data.
 */


export default class HSS {
    private _botObject = lodash.cloneDeep(botObject);


    /**
     * Creates a new HSS instance and initialize it.
     *
     * Note: Check that the trading pair is available on the exchange as the HSS
     * runs in sandbox mode and not all trading pairs are available.
     *
     * @param tradingPair The trading pair (optional, defaults to BNB/BUSD).
     * @param initialQuoteBalance The initial quote balance to start with.
     * @param timeframe The timeframe to use (optional, defaults to 1m).
     * @param ohlcvLimit The limit of OHLCV candles (optional, defaults to 512).
     * @returns The bot instance.
     */
    constructor(
        tradingPair = "BNB/BUSD",
        initialQuoteBalance = 0,
        timeframe: NsGeneral.IsTimeframe = "1m",
        ohlcvLimit = 512
    ) {
        // Trading pair
        const tokens = parseTradingPair(tradingPair);
        this._botObject.start.tradingPair = tradingPair;
        this._botObject.start.baseCurrency = tokens.base;
        this._botObject.start.quoteCurrency = tokens.quote;
        this._botObject.start.initialQuoteBalance = initialQuoteBalance;

        // Timestamps
        this._botObject.local.stringTimeframe = timeframe;
        this._botObject.start.timeframe = getTimeframe(timeframe);
        this._botObject.start.ohlcvLimit = ohlcvLimit;

        // Logging
        logger.info(`New HSS instance for '${tradingPair}' created.`);
        logger.info(`Initial quote balance: ${initialQuoteBalance} ${tradingPair.split("/")[1]}`);
        logger.info(`Timeframe: ${timeframe}`);

        // Initialize the bot
        this._botObject.local.initialized = this._initialize();
    }

    /**
     * Initialize the bot.
     */
    private async _initialize(): Promise<void> {
        // Load the exchange (Sandbox mode)
        this._botObject.local.exchange = loadExchange(true);

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
        this._botObject.start.baseBalance = getBalance(
            this._botObject.local.balances,
            this._botObject.start.baseCurrency
        );

        this._botObject.start.quoteBalance = getBalance(
            this._botObject.local.balances,
            this._botObject.start.quoteCurrency
        );

        // Check the balances
        if (this._botObject.start.baseBalance === null) {
            logger.error(`The base currency ${this._botObject.start.baseCurrency} is not available!`);
            process.exit(1);
        }

        if (this._botObject.start.quoteBalance === null) {
            logger.error(`The quote currency ${this._botObject.start.quoteCurrency} is not available!`);
            process.exit(1);
        }

        // Get the cache (OHLCV & other data)
        this._botObject.local.cache = new Cache(
            this._botObject.local.exchange,
            this._botObject.start.tradingPair,
            this._botObject.local.stringTimeframe,
            this._botObject.start.ohlcvLimit
        );

        // Load the initial cache
        await this._botObject.local.cache.load();
    }

    /**
     * The main function for the HSS.
     * @param strategy The strategy to score.
     */
    private async _main(strategy: typeof Strategy): Promise<void> {
        // Update the cache to ensure that the latest data is available
        if (this._botObject.local.cache) {
            await this._botObject.local.cache.update();
        }

        logger.info(`${this._botObject.local.cache?.priceBars.length} price bars available for scoring.`);
    }

    /**
     * Start the HSS.
     * @param strategy The strategy to score.
     */
    public async start(strategy: typeof Strategy): Promise<void> {
        // Await the initialization
        await this._botObject.local.initialized;

        // Main Loop
        this._botObject.local.running = true;

        // Updates the last start time
        this._botObject.start.lastStartTime = getCurrentDateString();

        await Promise.all([
            this._main(strategy)
        ]);
    }

    /**
     * Stop the HSS.
     */
    public async stop(): Promise<void> {
        // Await the initialization
        await this._botObject.local.initialized;

        // Stop the bot
        this._botObject.local.running = false;

        // Update the shared object
        this._botObject.stop.lastStopTime = getCurrentDateString();

        // Log the HSS stop
        logger.info("HSS stopped.");
    }
}