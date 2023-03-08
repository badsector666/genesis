import ccxt from "ccxt";

import { EXCHANGE_CONFIG } from "configs/global.config";
import logger from "tools/logger";


/**
 * Load the CCXT exchange (rate limited).
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

    // Log the exchange information
    logger.info(
        `${exchange.name} exchange loaded in ${EXCHANGE_CONFIG.sandboxMode ? "sandbox" : "production"} mode.`
    );

    exchange.setSandboxMode(EXCHANGE_CONFIG.sandboxMode);

    return exchange;
}