import NsBot from "types/bot";
import NsBotStats from "types/botStats";


export const botStats: NsBotStats.IsBotStats = {
    _id: "",                            // Bot identifier (MongoDB objectID)

    _botInfo: {
        _name: "",                          // Bot name (used for statistics & converted to ObjectId)
        _sandbox: false,                    // Sandbox mode
    },
    _timestamps: {
        _initTime: "",                      // First initialization time
        _lastStartTime: "",                 // Last start time
        _lastStopTime: "",                  // Last stop time
        _lastStatsUpdate: "",               // Last statistics update time
    },
    _botParams: {
        _timeframe: 0,                      // Timeframe  (in ms)
        _tradingPair: "",                   // Trading pair
        _initialQuoteBalance: 0,            // Initial quote balance to start with
    },
    _tradeStats: {
        // General trading statistics
        _tradeSuccessRate: 0,               // Trade success rate (in %)
        _maxDrawdown: 0,                    // Maximum drawdown (max loss in %)
        _maxConsecutiveWins: 0,             // Maximum consecutive wins
        _maxConsecutiveLosses: 0,           // Maximum consecutive losses

        // Total trading statistics
        _totalTrades: 0,                    // Number of total trades
        _totalTradesWon: 0,                 // Number of total trades won
        _totalTradesLost: 0,                // Number of total trades lost
        _totalTradeVolume: 0,               // Total trade volume (in quote currency)
        _totalFees: 0,                      // Total fees (in quote currency)
        _totalProfit: 0,                    // Total profit (in quote currency)

        // Average trading statistics
        _avgTradeSize: 0,                   // Average trade size (in quote currency)
        _avgTradeDuration: 0,               // Average trade duration (in seconds)
        _avgTradeProfit: 0,                 // Average trade profit (in quote currency)
        _avgFeePerTrade: 0,                 // Average fee per trade (in quote currency)
        _avgDailyProfitPercentage: 0        // Average daily profit percentage (in %)
    }
};

export const botData: NsBot.IsBotData = {
    // Promise to wait for the bot to be initialized
    _initialized: new Promise<void>((resolved) => {
        resolved();
    }),

    _name: "",                          // Bot name (used for statistics & converted to ObjectId)
    _sandbox: false,                    // Sandbox mode
    _running: false,                    // If the bot is running

    _tradingPair: "",                   // Trading pair
    _initialQuoteBalance: 0,            // Initial quote balance
    _timeframe: 0,                      // Timeframe (in ms)

    _baseCurrency: "",                  // Base currency
    _baseBalance: null,                 // Base currency balance
    _quoteCurrency: "",                 // Quote currency
    _quoteBalance: null,                // Quote currency balance

    _timeDifference: 0                  // Time difference between the exchange and the bot
};