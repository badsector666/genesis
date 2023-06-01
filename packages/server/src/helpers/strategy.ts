import { OHLCV, priceBar } from "ccxt/js/src/base/types";

export function convertOHLCVToPriceBar(ohlcv: OHLCV):priceBar {
    const [timestamp, open, high, low, close, volume] = ohlcv;
    const avgPrice = (open + high + low + close) / 4;
    const medPrice = (high + low) / 2;

    return [timestamp, open, high, low, close, volume, avgPrice, medPrice];
}