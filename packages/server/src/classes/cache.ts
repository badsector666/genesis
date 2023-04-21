import ccxt from "ccxt";

import { fetchOHLCV } from "helpers/exchange";
import { getTimeframe } from "helpers/inputs";
import NsGeneral from "types/general";
import logger from "utils/logger";


export default class Cache {
    private _initialized = new Promise<void>(() => null);

    private _exchange: ccxt.Exchange;
    private _tradingPair: string;
    private _timeframe: NsGeneral.IsTimeframe;
    private _nbTimeframe: number;
    private _ohlcvLimit: number;
    private _ohlcv: ccxt.OHLCV[] = [];


    /**
     * Creates a new cache containing optimized market calls.
     * @param exchange The initialized exchange.
     * @param tradingPair The trading pair.
     * @param timeframe The timeframe.
     * @param ohlcvLimit The limit of OHLCV candles.
     */
    constructor(
        exchange: ccxt.Exchange,
        tradingPair: string,
        timeframe: NsGeneral.IsTimeframe,

        // OHLCV
        ohlcvLimit: number
    ) {
        // Static parameters
        this._exchange = exchange;
        this._tradingPair = tradingPair;
        this._timeframe = timeframe;
        this._nbTimeframe = getTimeframe(timeframe);
        this._ohlcvLimit = ohlcvLimit;
    }

    /**
     * Sorts the OHLCV candles by time.
     * Note: removes the oldest candles while also removing the duplicates.
     * @returns True if the OHLCV candles are correct, false otherwise.
     */
    private async _sortOHLCV(): Promise<boolean> {
        // Remove the oldest candles while also removing the duplicates
        const savedTimes = this._ohlcv.map((candle) => candle[0]);
        const uniqueTimes = [...new Set(savedTimes)];

        // Sorts the unique times by security
        uniqueTimes.sort((a, b) => a - b);

        // Change the OHLCV array to match the unique times
        const tempOHLCV: ccxt.OHLCV[] = [];

        for (let i = 0; i < uniqueTimes.length; i++) {
            const candle = this._ohlcv.find((candle) => candle[0] === uniqueTimes[i]);

            if (candle) {
                tempOHLCV[i] = candle;
            }
        }

        // Remove the oldest candles if the limit is reached
        if (tempOHLCV.length > this._ohlcvLimit) {
            tempOHLCV.splice(0, tempOHLCV.length - this._ohlcvLimit);
        }

        // By security, verify that no candle is missing
        if (tempOHLCV.length !== this._ohlcvLimit) {
            return false;
        }

        for (let i = 0; i < tempOHLCV.length - 1; i++) {
            const currentCandleTime = tempOHLCV[i][0];
            const nextCandleTime = tempOHLCV[i + 1][0];

            if (currentCandleTime + this._nbTimeframe !== nextCandleTime) {
                return false;
            }
        }

        // Apply the new OHLCV array
        this._ohlcv = tempOHLCV;

        return true;
    }

    /**
     * Loads the cache.
     */
    public async load(): Promise<void> {
        this._ohlcv = await fetchOHLCV(
            this._exchange,
            this._tradingPair,
            this._timeframe,
            undefined,
            this._ohlcvLimit
        );
    }

    /**
     * Updates the cache.
     */
    public async update(): Promise<void> {
        const lastCandleTime = this._ohlcv[this._ohlcv.length - 1][0];

        const newCandles = await fetchOHLCV(
            this._exchange,
            this._tradingPair,
            this._timeframe,
            lastCandleTime - this._nbTimeframe,
            this._ohlcvLimit
        );

        // Add raw new candles to the OHLCV array before sorting
        this._ohlcv.push(...newCandles);

        // Sort the OHLCV candles by time
        const areCandlesCorrect = await this._sortOHLCV();

        // If the candles are not correct, reload the cache
        if (!areCandlesCorrect) {
            logger.warning("The OHLCV candles are not correct, reloading the cache...");

            await this.load();
        }

        console.log(this._ohlcv);
    }
}