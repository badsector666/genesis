import ccxt from "ccxt";

import { EXCHANGE_CONFIG } from "configs/global.config";
import logger from "helpers/logger";


/**
 * Load the a exchange instance (rate limited).
 * Note: Should be called once per application.
 * @returns The exchange.
 */
export function loadExchange(): ccxt.Exchange {
    const keys = {
        apiKey: EXCHANGE_CONFIG.sandboxMode ? EXCHANGE_CONFIG.sandboxApiKey : EXCHANGE_CONFIG.apiKey,
        secret: EXCHANGE_CONFIG.sandboxMode ? EXCHANGE_CONFIG.sandboxApiSecret : EXCHANGE_CONFIG.apiSecret
    };

    const exchange = new ccxt.binance({
        apiKey: keys.apiKey,
        secret: keys.secret,
        enableRateLimit: true
    });

    exchange.setSandboxMode(EXCHANGE_CONFIG.sandboxMode);

    // Log the exchange information
    logger.info(
        `${exchange.name} exchange loaded in ${EXCHANGE_CONFIG.sandboxMode ? "sandbox" : "production"} mode.`
    );

    return exchange;
}

/**
 * Load the CCXT market (complete).
 * @param exchange The exchange.
 * @returns The markets.
 */
export async function loadMarkets(exchange: ccxt.Exchange): Promise<ccxt.Dictionary<ccxt.Market>> {
    const markets = await exchange.loadMarkets();

    // Log the market information
    logger.info(`${exchange.name} markets loaded.`);

    return markets;
}

/**
 * Fetch the latest ticker data by trading symbol.
 * @param exchange The exchange.
 * @param symbol The symbol.
 * @returns The ticker.
 */
export async function fetchTicker(exchange: ccxt.Exchange, symbol: string): Promise<ccxt.Ticker> {
    const ticker = await exchange.fetchTicker(symbol);

    // Log the ticker information
    logger.verbose(`${exchange.name} ticker fetched for ${symbol}.`);

    return ticker;
}

/**
 * Fetch the order book for a symbol.
 */
export async function fetchOrderBook(exchange: ccxt.Exchange, symbol: string): Promise<ccxt.OrderBook> {
    const orderBook = await exchange.fetchOrderBook(symbol);

    // Log the order book information
    logger.verbose(`${exchange.name} order book fetched for ${symbol}.`);

    return orderBook;
}

/**
 * Fetch the trades for a symbol.
 */
export async function fetchTrades(exchange: ccxt.Exchange, symbol: string): Promise<ccxt.Trade[]> {
    const trades = await exchange.fetchTrades(symbol);

    // Log the trades information
    logger.verbose(`${exchange.name} trades fetched for ${symbol}.`);

    return trades;
}

/**
 * Fetch the OHLCV (Open, High, Low, Close, and Volume) candles for a symbol.
 * @param exchange The exchange.
 * @param symbol The symbol.
 * @param timeframe The timeframe.
 * @param since The since.
 * @param limit The limit.
 * @returns The OHLCV candles.
 */
export async function fetchOHLCV(
    exchange: ccxt.Exchange,
    symbol: string,
    timeframe = "1m",
    limit = 60
): Promise<ccxt.OHLCV[]> {
    const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);

    // Log the OHLCV information
    logger.verbose(`${exchange.name} OHLCV fetched for ${symbol} (${limit} x ${timeframe}).`);

    return ohlcv;
}

/**
 * Precalculate the fees for a trade.
 *
 * **WARNING!** This method is experimental, unstable and may produce
 * incorrect results in certain cases.
 * @param exchange The exchange.
 * @param symbol The symbol.
 * @param type The type.
 * @param side The side.
 * @param amount The amount to trade.
 * @returns The fee.
 */
export async function precalculateFees(
    exchange: ccxt.Exchange,
    symbol: string,
    type: "market" | "limit",
    side: "buy" | "sell",
    amount: number
) {
    // Current market price
    const ticker = await fetchTicker(exchange, symbol);
    const price = ticker.last;

    // Simulate the trade
    const fee = await exchange.calculateFee(symbol, type, side, amount, price);

    // Log the fee information
    logger.verbose(`${exchange.name} fees measured for ${symbol} (${amount} x ${price}).`);

    // Check if the price is undefined and return raw fee if so
    if (price === undefined) {
        logger.warn(`${exchange.name} price is undefined for ${symbol}.`);
        return fee;
    }

    // Add more readable fee information
    fee.transactionCost = amount * price;
    fee.tradingFee = fee.transactionCost * fee.rate;
    fee.totalCost = fee.transactionCost + fee.tradingFee;

    return fee;
}