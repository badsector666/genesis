import ccxt from "ccxt";

import { EXCHANGE_CONFIG } from "configs/global.config";
import logger from "helpers/logger";


/**
 * Load the a exchange instance (rate limited).
 *
 * **WARNING!** Should be called once per application.
 * @returns The exchange.
 */
export function loadExchange(sandbox: boolean): ccxt.Exchange {
    const keys = {
        apiKey: sandbox ? EXCHANGE_CONFIG.sandboxApiKey : EXCHANGE_CONFIG.apiKey,
        secret: sandbox ? EXCHANGE_CONFIG.sandboxApiSecret : EXCHANGE_CONFIG.apiSecret
    };

    const exchange = new ccxt.binance({
        apiKey: keys.apiKey,
        secret: keys.secret,
        enableRateLimit: true
    });

    exchange.setSandboxMode(sandbox);

    // Log the exchange information
    logger.info(
        `${exchange.name} exchange loaded in ${sandbox ? "sandbox" : "production"} mode.`
    );

    return exchange;
}

/**
 * Check the exchange status.
 *
 * NOTES:
 * - The printed eta represents when the maintenance/outage is expected to end.
 * - The exchange status is not available in sandbox mode, skipping it.
 *
 * @param exchange The exchange.
 * @param fatal If the exchange is not reliable, should the application exit?
 * @returns The status (boolean if status -> ok).
 */
export async function checkExchangeStatus(exchange: ccxt.Exchange, fatal = true): Promise<boolean> {
    let status;

    try {
        status = await exchange.fetchStatus();
    } catch (error) {
        logger.warn(`${exchange.name} status check is unavailable in sandbox mode! Skipping...`);
        return true;
    }

    // Log the status information
    const eta = status.eta ? new Date(status.eta).toLocaleString() : "N/A";

    logger.info(`${exchange.name} status checked.`);
    logger.verbose(`${exchange.name} status: ${status.status}, eta: ${eta}.`);

    // Fatal error if exchange is not reliable
    if (status.status !== "ok") {
        logger.error("Exchange is not reliable!");

        if (fatal) {
            process.exit(1);
        }
    }

    return status.status === "ok";
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
 * Load the exchange balances (every token).
 * @param exchange The exchange.
 * @returns The balances.
 */
export async function loadBalance(exchange: ccxt.Exchange): Promise<ccxt.Balances> {
    const balance = await exchange.fetchBalance();

    // Log the balance information
    logger.info(`${exchange.name} balances loaded.`);

    return balance;
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

/**
 * Fetch the exchange time to get the local/exchange time synchronization difference.
 * @param exchange The exchange.
 * @returns The time (UNIX).
 */
export async function exchangeTimeDifference(exchange: ccxt.Exchange): Promise<number> {
    let fetchTimeDelay = performance.now();
    const serverTime = await exchange.fetchTime();
    fetchTimeDelay = performance.now() - fetchTimeDelay;
    const localTime = Date.now();

    const timeDifference = serverTime - (localTime + Math.round(fetchTimeDelay));

    // Log the time information
    logger.verbose(`Difference between ${exchange.name} and local time: ${timeDifference}ms.`);

    return timeDifference;
}