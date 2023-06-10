import "configs/env";
import minimist from "minimist";

import generator from "classes/systems/GS";
import { removeDays } from "helpers/inputs";
import NsGeneral from "types/general";
import logger from "utils/logger";


/**
 * Runs the GS main function with the command line arguments parsed.
 * @property `-tradingPair` The trading pair to generate the data for.
 * @property `-timeframe` The timeframe to generate the data for.
 * @property `-since` The timestamp to start generating the data from.
 */
async function main(args: minimist.ParsedArgs) {
    const options: NsGeneral.generatorSystemOptions = {
        tradingPair: "BNB/USDT",
        timeframe: "1m",
        since: 0
    };

    if (args.tradingPair) {
        options.tradingPair = args.tradingPair as string;
    } else {
        logger.warn("No 'tradingPair' parameter provided, defaults to BNB/USDT.");
    }

    if (args.timeframe) {
        options.timeframe = args.timeframe as NsGeneral.IsTimeframe;
    } else {
        logger.warn("No 'timeframe' parameter provided, defaults to 1m.");
    }

    if (args.since) {
        options.since = args.since as number;
    } else {
        logger.warn("No 'since' parameter provided, defaults to 30 days.");
        const currentDate = new Date();
        const since = removeDays(currentDate, 30).getTime();

        options.since = since;
    }

    await generator(options);
}

const args = minimist(process.argv.slice(2));
main(args)
    .then(() => {
        process.exit(0);
    }).catch((error) => {
        logger.error(error);
        process.exit(1);
    });