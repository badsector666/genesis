import "configs/env";

import Bot from "classes/bot";


const bot = new Bot("MATIC/USDT", "Rompish", true, 20, "1s");

bot.start();

setTimeout(async () => {
    await bot.stop();
}, 60000);