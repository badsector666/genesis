import Strategy from "classes/strategies/strategy";
import NsStrategy from "types/strategy";
import logger from "utils/logger";


export default class Strategy_2 extends Strategy {

    getLevels(timestamp: number, priceBars: Array<NsStrategy.priceBar>, first = true) {

        this.percentage = 0.002;


        for (const priceBar of priceBars) {
            if (priceBar.timestamp === timestamp) {
                if (first) {
                    return [priceBar.open * (1 - this.percentage), priceBar.open * (1 + this.percentage)];
                }

                else {
                    return [priceBar.open * (1 - this.percentage * 2), priceBar.open * (1 - this.percentage)];
                }
            }
        }
    }

    run(pricesBars: Array<NsStrategy.priceBar>): Array<number> {

        let firstBuyPrice = 0;
        let secondBuyPrice = 0;


        for (const priceBar of pricesBars) {

            let firstLevels: Array<number> | undefined = [0, 0];
            let secondLevels: Array<number> | undefined = [0, 0];


            if (!this._inPositionArray[0]) {
                firstLevels = this.getLevels(priceBar.timestamp, pricesBars);
                secondLevels = this.getLevels(priceBar.timestamp, pricesBars, false);
                if (firstLevels !== undefined) {
                    if (priceBar.low <= firstLevels[0]) {
                        logger.info(priceBar.timestamp);
                        logger.info(`Buy the first at ${priceBar.close}`);
                        firstBuyPrice = priceBar.close;
                        this._inPositionArray[0] = true;
                    }
                }
            }
            else if (!this._inPositionArray[1]) {
                if (secondLevels !== undefined) {
                    if (priceBar.low <= secondLevels[0]) {
                        logger.info(priceBar.timestamp);
                        logger.info(`Buy the second at ${priceBar.close}`);
                        secondBuyPrice = priceBar.close;
                        this._inPositionArray[1] = true;
                    }
                    else if (priceBar.high >= firstLevels[1]) {
                        logger.info(priceBar.timestamp);
                        logger.info(`Sell the first at ${priceBar.close}`);
                        this._inPositionArray[0] = false;
                        this._profits.push(priceBar.close - firstBuyPrice);
                    }
                }
            }

            else {
                if (priceBar.high > secondLevels[1]) {
                    logger.info(priceBar.timestamp);
                    logger.info(`Sell the second at ${priceBar.close}`);
                    this._inPosition = false;
                    this._profits.push(priceBar.close - secondBuyPrice);
                }
            }
        }
        return this._profits;
    }
}