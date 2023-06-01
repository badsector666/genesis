declare namespace NsStrategy {

    interface OHLCV {
        timestamp: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }

    interface priceBar {
        timestamp: OHLCV["timestamp"];
        open: OHLCV["open"];
        high: OHLCV["high"];
        low: OHLCV["low"];
        close: OHLCV["close"];
        volume: OHLCV["volume"];
        avgPrice: number;
        medPrice: number;
    }

    /**
         * A result object emitted by each strategy.
         */
    interface strategyResult {
        strategy: string;
        result: boolean;
        profit: number;
    }
}


export default Strategy;
