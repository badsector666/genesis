import ccxt from "ccxt";

import { fetchOHLCV } from "helpers/exchange";


export default class Market {
    private _ohlcv: ccxt.OHLCV[] = [];


    /**
     * Creates a new market which is similar to a Cache for market data.
     * @param exchange The initialized exchange.
     * @param symbol The symbol.
     * @param timeframe The timeframe.
     * @param ohlcvLimit The limit of OHLCV candles.
     * @param smaPeriod The period for the SMA.
     * @param bbPeriod The period for the Bollinger Bands.
     * @param bbDeviation The deviation for the Bollinger Bands.
     * @param rsiPeriod The period for the RSI.
     * @param rsiSafeDiv Is the RSI safe division enabled?
     */
    constructor(
        exchange: ccxt.Exchange,
        symbol: string,
        timeframe: "1s" | "30s" | "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "1d",

        // OHLCV
        ohlcvLimit: number,

        // SMA
        smaPeriod: number,

        // Bollinger Bands
        bbPeriod: number,
        bbDeviation: number,

        // RSI
        rsiPeriod: number,
        rsiSafeDiv: boolean,
    ) {
        //
    }

    /**
     * Updates the OHLCV cache with the latest data.
     */
    public async updateOHLCV(): Promise<void> {
        //
    }

}