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
     * Sent to the MongoDB database.
     *
     * Note that statistics should never be used as input for the bot,
     * but rather as a way to track the bot's performance.
     */
    interface IsStatistics {
        _id: string;
        _initTime: string;
        _tradingCount: number;
        _isSandBox: boolean;
        _tradingPair: string;
        _initialQuoteBalance: number;
        _totalProfit: number;
    }

    /**
     * Bot data.
     */
    interface IsBotData {
        _isSandBox: boolean;
        _tradingPair: string;
        _baseCurrency: string;
        _baseBalance: ccxt.Balance | null;
        _quoteCurrency: string;
        _quoteBalance: ccxt.Balance | null;
        _initialQuoteBalance: number;
        _totalProfit: number;
        _timeDifference: number;
    }
}


export default NsBot;