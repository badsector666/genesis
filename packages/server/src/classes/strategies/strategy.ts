// The default strategy class

import { priceBar } from "ccxt/js/src/base/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _ from "lodash";


export default class Strategy {

    private _inPosition = false;
    private _profits: Array<number> = [];

    run(OHLCVs: Array<priceBar>): Array<number> {
        for (const row of OHLCVs) {

            let buyPrice = 0;
            let boughtAt = 0;
            let tp = 0;
            let sl = 0;

            const percentage = 0.02;

            const rowEvolution = row[4] / row[1] - 1; //close/open

            let index = 1;

            if (!this._inPosition) {
                if (rowEvolution > percentage / 2) {
                    buyPrice = row[4]; //close
                    boughtAt = index;
                    tp = buyPrice * (1 + percentage);
                    sl = buyPrice * (1 - percentage);
                    this._inPosition = true;
                }

            }

            else if (index > boughtAt) {
                if (row[2] > tp) { //high
                    this._profits.push(percentage);
                    this._inPosition = false;
                }

                else if (row[3] < sl) { //low
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