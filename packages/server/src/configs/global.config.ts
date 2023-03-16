/**
 * General configuration.
 */
export const GENERAL_CONFIG = {
    verbose: true,                          // Set the winston logger to verbose mode
    timeframeFactorForGeneralLoop: 2        // The timeframe factor for the general loop (x2 by default)
};

/**
 * Network configuration.
 */
export const NETWORK_CONFIG = {
    checkNetwork: true,
    checkNetworkInterval: 1000 * 60 * 60 * 24,  // 1 day
    jitterLimit: 5,                             // ms
    latencyLimit: 100,                          // ms
    downloadLimit: 1,                           // Mo/s
    uploadLimit: 1                              // Mo/s
};

/**
 * Exchange configuration.
 */
export const EXCHANGE_CONFIG = {
    sandboxTradingPair: "BNB/BUSD",
    sandboxApiKey: process.env.BINANCE_SANDBOX_API_KEY,
    sandboxApiSecret: process.env.BINANCE_SANDBOX_API_SEC,
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SEC
};