/* eslint-disable @typescript-eslint/no-unused-vars */
import Strategy from "classes/strategies/strategy";
import NsStrategy from "types/strategy";
import logger from "utils/logger";


export default class Strategy_3 extends Strategy {

    getLevels(timestamp: number, priceBars: Array<NsStrategy.priceBar>): Array<number> {

        this.percentage = 0.618;

        const _values = [(0 - this.percentage), this.percentage, (1 + this.percentage)];

        let series_: NsStrategy.priceBar;
        let diff: number;
        let levels: Array<number>;


        for (const priceBar of priceBars) {
            if (priceBar.timestamp === timestamp) {
                series_ = priceBar;
                diff = series_.high - series_.low;
                levels = [_values[0] * diff + series_.close, _values[1] * diff + series_.close, _values[2] * diff + series_.close];
                return levels;
            }
        }
        return [0, 0, 0];
    }

    run(pricesBars: Array<NsStrategy.priceBar>): Array<number> {

        let buyPrice = 0;


        for (const priceBar of pricesBars) {

            const [sl, entry, tp] = this.getLevels(priceBar.timestamp, pricesBars);


            if (!this._inPosition && priceBar.close >= entry) {
                logger.info(`Buy at ${priceBar.close}`);
                buyPrice = priceBar.close;
                this._inPosition = true;
            }
            else if (this._inPosition) {
                if (priceBar.close <= sl || priceBar.close >= tp) {
                    logger.info(`Sell at ${priceBar.close}`);
                    this._profits.push(priceBar.close - buyPrice);
                    this._inPosition = false;

                }
            }
        }
        return this._profits;
    }
}