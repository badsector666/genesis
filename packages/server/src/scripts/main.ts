import ccxt from "ccxt";
import "helpers/env";

import { loadExchange } from "tools/exchange";

loadExchange();

// const exchange = new ccxt.binance({
//     apiKey: process.env.BINANCE_SANDBOX_API_KEY,
//     secret: process.env.BINANCE_SANDBOX_API_SECRET,
//     enableRateLimit: true
// });

// exchange.setSandboxMode(true);

// async function getAccountBalance() {
//     const balance = await exchange.fetchOrders();
//     return balance;
// }

// getAccountBalance().then((balance) => {
//     console.log(balance);
// }).catch((err) => {
//     console.error(err);
// });