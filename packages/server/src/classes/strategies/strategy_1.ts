import Strategy from "classes/strategies/strategy";
import NsStrategy from "types/strategy";

// eslint-disable-next-line @typescript-eslint/no-unused-vars


export default class Strategy_1 extends Strategy {

    run(pricesBars: Array<NsStrategy.priceBar>): Array<number> {
        for (const priceBar of pricesBars) {

            let buyPrice = 0;
            let boughtAt = 0;
            let tp = 0;
            let sl = 0;

            const percentage = 0.02;

            priceBar.pctChange = priceBar.close / priceBar.open - 1;

            let index = 1;

            if (!this._inPosition) {
                if (priceBar.pctChange > percentage / 2) {
                    buyPrice = priceBar.close; //close
                    boughtAt = index;
                    tp = buyPrice * (1 + percentage);
                    sl = buyPrice * (1 - percentage);
                    this._inPosition = true;
                }

            }

            else if (index > boughtAt) {
                if (priceBar.high > tp) { //high
                    this._profits.push(percentage);
                    this._inPosition = false;
                }

                else if (priceBar.low < sl) { //low
                    this._profits.push(0 - percentage);
                    this._inPosition = false;
                }
                else {
                    this._profits.push(19);
                    this._inPosition = false;
                }
            }

            index++;
        }
        return this._profits;
    }
}

