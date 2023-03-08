/**
 * General configuration.
 */
export const GENERAL_CONFIG = {
    verbose: true
};

/**
 * Exchange configuration.
 */
export const EXCHANGE_CONFIG = {
    sandboxMode: true,
    sandboxApiKey: process.env.BINANCE_SANDBOX_API_KEY,
    sandboxApiSecret: process.env.BINANCE_SANDBOX_API_SEC,
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SEC
};