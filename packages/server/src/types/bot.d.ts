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