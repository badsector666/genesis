import "configs/env";
import { Strategy1__INTRADAY } from "classes/strategies";
import HSS from "classes/systems/HSS";


async function main() {
    const scoringClass = new HSS("BNB/USDT", 0, "1m", 512);
    await scoringClass.start(Strategy1__INTRADAY);
}

main();