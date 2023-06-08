// Historical Scoring System (HSS)

import { Exchange } from "ccxt";

import Cache from "classes/cache";
import { EXCHANGE_CONFIG, GENERAL_CONFIG } from "configs/global.config";
import {
    checkExchangeStatus,
    exchangeTimeDifference,
    getBalance,
    loadBalances,
    loadExchange,
    loadMarkets,
    parseTradingPair
} from "helpers/exchange";
import { getTimeframe } from "helpers/inputs";
import NsGeneral from "types/general";
import logger from "utils/logger";


export default class HSS {
    private _initialized: Promise<void>;

    private _tradingPair: { base: string, quote: string; };
    private _baseCurrency: string;
    private _quoteCurrency: string;
    private _initialQuoteBalance: number;
    private _stringTimeframe: string;
    private _timeframe: number;
    private _ohlcvLimit: number;

    private _exchange: Exchange | null = null;


    /**
     * Creates a new HSS instance and initialize it.
     *
     * @param tradingPair The trading pair (overridden in sandbox mode).
     * @param initialQuoteBalance The initial quote balance to start with.
     * @param timeframe The timeframe to use (optional, defaults to 1m).
     * @param ohlcvLimit The limit of OHLCV candles (optional, defaults to 128).
     * @returns The bot instance.
     */
    constructor(
        tradingPair: string,
        initialQuoteBalance = 0,
        timeframe: NsGeneral.IsTimeframe = "1m",
        ohlcvLimit = 128
    ) {
        // Trading pair
        this._tradingPair = parseTradingPair(tradingPair);
        this._baseCurrency = this._tradingPair.base;
        this._quoteCurrency = this._tradingPair.quote;
        this._initialQuoteBalance = initialQuoteBalance;

        // Timestamps
        this._stringTimeframe = timeframe;
        this._timeframe = getTimeframe(timeframe);
        this._ohlcvLimit = ohlcvLimit;

        // Logging
        logger.info(`New HSS instance created for ${tradingPair}.`);
        logger.info(`Initial quote balance: ${initialQuoteBalance} ${tradingPair.split("/")[1]}`);
        logger.info(`Timeframe: ${timeframe}`);

        // Initialize
        this._initialized = this._initialize();
    }

    /**
     * Initialize the bot.
     */
    private async _initialize(): Promise<void> {
        // Load the exchange
        this._exchange = loadExchange(true);

        // Check the exchange status (FATAL)
        // Endpoint not available in sandbox mode
        await checkExchangeStatus(this._exchange);

        // Load the markets
        await loadMarkets(this._exchange);
    }
}