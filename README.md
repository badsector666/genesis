# Bibobot
A Typescript-based trading bot that leverages the volatility of the crypto market to make profits.


Technical summary
-----------------
The two services are the server (TS Node) and the client (React - TS).

- Moving average to identify trends, avoiding to buy at peak.
- Stop loss order, minimize losses by defining a loss limit.
- RSI, MACD, Bollinger Bands to identify overbought or oversold conditions.
- Limit order instead of a market order to avoid buying at higher prices.

Bot statistics
--------------
The statistics are stored inside a MongoDB database, the identifier set when creating
a new bot is hashed using the `string-hash` package.

If the hash already exists inside the database, the bot will recover the previous statistics
and update them, if not, it will send new statistics.