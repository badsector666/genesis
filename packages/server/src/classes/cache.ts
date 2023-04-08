import ccxt from "ccxt";

import { fetchOHLCV } from "helpers/exchange";
import { getTimeframe } from "helpers/inputs";
import NsGeneral from "types/general";


export default class Cache {
    private _initialized = new Promise<void>(() => null);

    private _exchange: ccxt.Exchange;
    private _tradingPair: string;
    private _timeframe: NsGeneral.IsTimeframe;
    private _nbTimeframe: number;
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

    }

    /**
     * Updates the OHLCV with the latest data.
     */
    private async _updateOHLCV(): Promise<void> {
        //
    }

    public async load(): Promise<void> {
        this._ohlcv = await fetchOHLCV(this._exchange, this._tradingPair, this._timeframe);

        console.log(this._ohlcv);
    }

    public async update(): Promise<void> {
        //
    }
}