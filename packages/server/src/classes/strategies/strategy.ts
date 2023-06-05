// The default strategy class

import { priceBar } from "ccxt/js/src/base/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import _ from "lodash";


export default class Strategy {

    protected _inPosition = false;
    protected _profits: Array<number> = [];
}