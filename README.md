# Bibobot
A Typescript-based trading bot that leverages the volatility of the crypto market to make profits.


Technical summary
-----------------
The two services are the server (TS Node) and the client (React - TS).

- Moving average to identify trends, avoiding to buy at peak.
- Stop loss order, minimize losses by defining a loss limit.
- RSI, MACD, Bollinger Bands to identify overbought or oversold conditions.
- Limit order instead of a market order to avoid buying at higher prices.