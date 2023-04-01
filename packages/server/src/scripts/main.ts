import "configs/env";

import Bot from "classes/bot";


const bot = new Bot("MATIC/USDT", "Rompish", true, 20, "1s");

bot.start();

setTimeout(async () => {
    await bot.stop();
}, 5000);


// import { getProcessUsage } from "utils/performances";

// bot.start();

// setTimeout(async () => {
//     await bot.stop();
// }, 5000);

// getProcessUsage().then((usage) => {
//     console.log(usage);
// });


// import {
//     fetchOHLCV,
//     fetchTicker,
//     loadExchange,
//     loadMarkets,
//     precalculateFees
// } from "helpers/exchange";



// const exchange = loadExchange();
// loadMarkets(exchange);

// precalculateFees(exchange, "MATIC/USDT", "market", "buy", 1).then((fees) => {
//     console.log(fees);
// });

// fetchTicker(exchange, "MATIC/USDT").then((ticker) => {
//     console.log(ticker);
// });



// fetchOHLCV(exchange, "MATIC/EUR").then((ohlcv) => {
//     const limit = 0.0001;

//     let buyHistory = ohlcv[0][1];
//     let possessSomething = true;
//     let sellHistory = 0;

//     let money = 0;
//     let quantity = 20;

//     // console.log(ohlcv);

//     console.log("BUY", "PRICE:", buyHistory, "MONEY:", buyHistory * quantity);

//     for (let i = 0; i < ohlcv.length; i++) {
//         const candle = ohlcv[i];
//         const open = candle[1];
//         const close = candle[4];

//         if (!possessSomething) {
//             if (open < sellHistory - limit) {
//                 console.log("BUY", "PRICE:", open, "SH:", sellHistory);
//                 buyHistory = open;
//                 possessSomething = true;

//                 money -= 0.020638;

//                 quantity = money / open;
//                 money = 0;
//             } else if (close < sellHistory - limit) {
//                 console.log("BUY", "PRICE:", close, "SH:", sellHistory);
//                 buyHistory = close;
//                 possessSomething = true;

//                 money -= 0.020638;

//                 quantity = money / close;
//                 money = 0;
//             }
//         }

//         if (possessSomething) {
//             if ((open > buyHistory + limit)) {
//                 console.log("SELL", "PRICE:", open, "BH:", buyHistory, "DIFF:", open - buyHistory);
//                 sellHistory = open;
//                 possessSomething = false;

//                 money = (quantity * open) - 0.020638;
//                 quantity = 0;
//             } else if (close > buyHistory + limit) {
//                 console.log("SELL", "PRICE:", close, "BH:", buyHistory, "DIFF:", close - buyHistory);
//                 sellHistory = close;
//                 possessSomething = false;

//                 money = (quantity * close) - 0.020638;
//                 quantity = 0;
//             }
//         }
//     }

//     console.log("\n\n");
//     console.log("MONEY:", money);
//     console.log("QUANTITY:", quantity);
// });