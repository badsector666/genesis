import "configs/env";

import Bot from "classes/bot";


const bot = new Bot("MATIC/USDT", "R&D", true, 20, "1d");

bot.start();

setTimeout(async () => {
    await bot.stop();
}, 6000);


