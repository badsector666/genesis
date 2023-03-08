import ccxt from "ccxt";
import * as dotenv from "dotenv";


dotenv.config({
    path: __dirname + "/../.env"
});

const exchange = new ccxt.binance({
    apiKey: process.env.BINANCE_SANDBOX_API_KEY,
    secret: process.env.BINANCE_SANDBOX_API_SECRET,
    enableRateLimit: true
});

exchange.setSandboxMode(true);

async function getAccountBalance() {
    const balance = await exchange.fetchBalance();
    return balance;
}

getAccountBalance().then((balance) => {
    console.log(balance);
}).catch((err) => {
    console.error(err);
});