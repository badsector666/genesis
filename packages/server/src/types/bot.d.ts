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
        _isSandbox: boolean;

        _initTime: string;
        _lastInitTime: string;
        _lastStopTime: string;
        _lastStatsUpdate: string;

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
        _isSandbox: boolean;
        _tradingPair: string;
        _baseCurrency: string;
        _baseBalance: ccxt.Balance | null;
        _quoteCurrency: string;
        _quoteBalance: ccxt.Balance | null;
        _initialQuoteBalance: number;
        _timeDifference: number;
    }
}


export default NsBot;