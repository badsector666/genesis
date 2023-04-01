import ccxt from "ccxt";
import { Db } from "mongodb";

import Cache from "classes/cache";
import NsGeneral from "types/general";


declare namespace NsBotObject {
    /**
     * MongoDB data.
     */
    interface IsMongoDB {
        mongoClient: MongoClient | null;
        mongoDB: Db | null;
    }

    interface IsBotObjectStart {
        name: string;
        id: string;
        timeframe: number;
        sandbox: boolean;

        tradingPair: string;
        baseCurrency: string;
        baseBalance: ccxt.Balance | null;
        quoteCurrency: string;
        quoteBalance: ccxt.Balance | null;
        initialQuoteBalance: number;

        lastStartTime: string;
    }

    interface IsBotObjectStop {
        lastStopTime: string;
    }

    interface IsBotObjectSharedArrays {
        tradeSizes: number[];
        tradeDurations: number[];
        tradeProfits: number[];
        feesPerTrade: number[];
        dailyProfits: number[];
    }

    interface IsBotObjectShared {
        arrays: IsBotObjectSharedArrays;

        generalIterations: number;
        mainIterations: number;

        tradeSuccessRate: number;
        maxDrawdown: number;
        maxConsecutiveWins: number;
        maxConsecutiveLosses: number;

        totalTrades: number;
        totalTradesWon: number;
        totalTradesLost: number;
        totalTradeVolume: number;
        totalFees: number;
        totalProfit: number;

        avgTradeSize: number;
        avgTradeDuration: number;
        avgTradeProfit: number;
        avgFeePerTrade: number;
        avgDailyProfitPercentage: number;
    }

    interface IsBotObjectLocal {
        initialized: Promise<void>;
        stringTimeframe: NsGeneral.IsTimeframe;
        running: boolean;
        networkCheck: boolean;
        exchange: ccxt.Exchange | null;
        balances: ccxt.Balances | null;
        cache: Cache | null;
    }

    interface IsBotObjectSpecials {
        initTime: string;
        lastSharedUpdate: string;

        mainTimeframeCorrector: number;
        timeDifference: number;
    }

    interface IsBotObject {
        start: IsBotObjectStart;
        stop: IsBotObjectStop;
        shared: IsBotObjectShared;
        local: IsBotObjectLocal;
        specials: IsBotObjectSpecials;
    }
}


export default NsBotObject;