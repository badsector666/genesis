import ccxt from "ccxt";
import { Db } from "mongodb";


declare namespace NsBot {
    /**
     * MongoDB data.
     */
    interface IsMongoDB {
        mongoClient: MongoClient | null;
        mongoDB: Db | null;
    }

    /**
     * Exchange data.
     */
    interface IsExchangeData {
        // Main raw exchange data
        _exchange: ccxt.Exchange | null;
        _balances: ccxt.Balances | null;
    }

    /**
     * Statistics.
     */
    interface IsStatistics {
        _id: string;
        _name: string;
        _sandbox: boolean;

        _initTime: string;
        _lastStartTime: string;
        _lastStopTime: string;
        _lastStatsUpdate: string;

        _timeframe: number;
        _tradingPair: string;
        _initialQuoteBalance: number;

        _tradeSuccessRate: number;
        _maxDrawdown: number;
        _maxConsecutiveWins: number;
        _maxConsecutiveLosses: number;

        _totalTrades: number;
        _totalTradesWon: number;
        _totalTradesLost: number;
        _totalTradeVolume: number;
        _totalFees: number;
        _totalProfit: number;

        _avgTradeSize: number;
        _avgTradeDuration: number;
        _avgTradeProfit: number;
        _avgFeePerTrade: number;
        _avgDailyProfitPercentage: number;
    }

    /**
     * Bot data.
     */
    interface IsBotData {
        _initialized: Promise<void>;
        _name: string;
        _sandbox: boolean;
        _running: boolean;

        _tradingPair: string;
        _initialQuoteBalance: number;
        _timeframe: number;

        _baseCurrency: string;
        _baseBalance: ccxt.Balance | null;
        _quoteCurrency: string;
        _quoteBalance: ccxt.Balance | null;

        _timeDifference: number;
    }
}


export default NsBot;