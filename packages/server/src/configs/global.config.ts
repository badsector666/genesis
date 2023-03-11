/**
 * General configuration.
 */
export const GENERAL_CONFIG = {
    verbose: true
};

/**
 * Network configuration.
 */
export const NETWORK_CONFIG = {
    checkNetwork: true,
    checkNetworkInterval: 1000 * 60 * 60 * 24,  // 1 day
    jitterLimit: 5,  // ms
    latencyLimit: 100,  // ms
    downloadLimit: 5,  // Mbit/s
    uploadLimit: 2  // Mbit/s
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