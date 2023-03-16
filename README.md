# Bibobot
A Typescript-based trading bot that leverages the volatility of the crypto market to make profits.


Technical summary
-----------------
The two services are the server (TS Node) and the client (React - TS).

- Moving average to identify trends, avoiding to buy at peak.
- Stop loss order, minimize losses by defining a loss limit ([Trailing stop loss ~20%](https://www.quant-investing.com/blog/truths-about-stop-losses-that-nobody-wants-to-believe)).
- RSI, MACD, Bollinger Bands to identify overbought or oversold conditions.
- Limit order instead of a market order to avoid buying at higher prices.

Bot initialization
------------------
Here's a sorted list of all the steps used by the bot during initialization,
either to ensure its good function, or to recover initial data.

`*` means that this feature is skipped in Sandbox mode for speed or API availability reasons.

- `*` Warning with user input for non-sandbox mode (reply `y` to continue, or any other char to stop the bot).
- `*` Check the network overall quality, the min values to pass the test can be found inside
  `global.config.ts`, these values are the download and upload speed, the latency and the jitter
  of your network. Note that the download and upload speed are limited to 10 Mo/s by the API that
  I'm using.
- Connect to the MongoDB database.
- Load the exchange (with sandbox or real mode passed directly)
- `*` Check the exchange status (Not available with Binance Sandbox API).
- Load the markets from the Binance API.
- Measure the difference of time between the Binance API servers and the local time,
  note that to improve the overall precision of the test, a `performance.now()` measures
  the time that the await function takes.
- Load all the balances from the Binance account linked to the API.
- Get the balances depending on the actual trading pair used (base/quote).
- Check the existence of these balances.
- Handle the statistics with the database (create new ones or recover existing ones for an ID).

Loop system
-----------
The bot runs with two `Promise` loops, one is the main used for the orders, algorithms etc..
the other one is the general one, used for statistics & other data update.

It's important to note that the main loop iteration internal time is measured using `performance.now()`,
so the internal time is subtracted to the final timeframe for a better precision.

Bot statistics
--------------
The statistics are stored inside a MongoDB database, the identifier set when creating
a new bot is hashed using the `crypto` package.

The hash will be different for bots in sandbox mode as the suffix `-sandbox` is added
to the name before hashing. If the hash already exists inside the database, the bot will
recover the previous statistics and update them, if not, it will send new statistics.

In conclusion, the name of a bot can be kept between sandbox & real mode without any issue.