declare namespace NsGeneral {
    /**
     * Valid timeframes for Binance.
     */
    type IsTimeframe = "1s" | "30s" | "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "1d";

    /**
     * Options for the generator system function.
     */
    interface generatorSystemOptions {
        tradingPair: string;
        timeframe: NsGeneral.IsTimeframe;
        since: number;
    }
}


export default NsGeneral;