declare namespace NsBotStats {
    interface IsBotInfo {
        _name: string;
        _sandbox: boolean;
    }

    interface IsPlatformInfo {
        _platform: string;

    }

    interface IsTimestamps {
        _initTime: string;
        _lastStartTime: string;
        _lastStopTime: string;
        _lastStatsUpdate: string;
    }

    interface IsBotParams {
        _timeframe: number;
        _tradingPair: string;
        _initialQuoteBalance: number;
    }

    interface IsTradeStats {
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
     * Bot statistics object.
     */
    interface IsBotStats {
        _id: string;
        _botInfo: IsBotInfo;
        _timestamps: IsTimestamps;
        _botParams: IsBotParams;
        _tradeStats: IsTradeStats;
    }
}


export default NsBotStats;