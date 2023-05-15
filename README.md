<p align="center">
    <a href="https://github.com/yoratoni/genesis" target="_blank">
        <img src="https://raw.githubusercontent.com/yoratoni/genesis/main/assets/logo.png" width="350" alt="Genesis logo">
    </a>
</p>

<p align="center">
    <a href="https://github.com/yoratoni" target="_blank">
        <img src="https://img.shields.io/badge/made%20by-Yoratoni-858FF0?style=flat-square">
    </a>
    <a href="https://github.com/yoratoni/genesis/blob/main/LICENSE" target="_blank">
        <img src="https://img.shields.io/github/license/yoratoni/bibobot?color=D962F2&style=flat-square">
    </a>
    <a href="https://github.com/yoratoni/genesis/issues" target="_blank">
        <img src="https://img.shields.io/github/issues-raw/yoratoni/genesis?color=FF8D70&style=flat-square">
    </a>
    <a href="https://github.com/yoratoni/genesis/blob/main/package.json" target="_blank">
        <img src="https://img.shields.io/github/package-json/v/yoratoni/genesis?color=FDD384&style=flat-square">
    </a>
</p>

A crypto trading bot that uses the volatility of the market to make profits.

Technical Summary
-----------------
The principle of the bot is based on a governance system with multiple trading strategies.
Each strategy is a set of rules that are applied to the market
to determine if a trade should be made or not.

This governance system (Strategy pool or SP) works with a scoring system. The score for each strategy is based
on the performance of the strategy on historical data.
The best strategies are then selected to be used in the live market.
Now, for each strategy to cohabit with the others, a weight is assigned to it based on its score.
The higher the score, the higher the weight, and the more the strategy choice will be taken into account.

All of this system is secured by a risk management system (RMS) that will prevent the bot from
making trades at lost if strategies are not performing well for some reason. This system acts
as a fallback to prevent the bot from losing money in the worst case scenario.

From the initialization of the bot to the live trading, we have the following steps:

#### Arguments:
1. Trading pair to trade on.
2. Name of the bot, used to identify it in the DB, logs, etc.
3. Sandbox mode (optional, default: true), using the sandbox mode will prevent the bot from making real trades
   and will simulate the trades instead, using Binance's testnet.
4. Timeframe (optional, default: 1m), the timeframe is the time interval between each candle,
   the higher the timeframe, the less trades will be made but more reliable they will be.

#### Initialization:
1. Assigns the formatted values to the private variables of the bot class.
2. Replace the trading pair if in sandbox mode, as most of them are not available on the testnet.
2. Sets a warning message in the console if the bot is not in sandbox mode.
3. Checks the network connection, ensures that the bot can connect to the internet
   with a minimum speed and latency (skipped in sandbox mode).
4. Connects to the database.
5. Loads the CCXT exchange object (sandbox mode or not).
6. Checks the status of the Binance exchange, ensures that it is not in maintenance.
7. Loads the markets from CCXT.
8. Calculates a time difference between the local time and the Binance server time.
9. Load the balances of the account from Binance.
10. Recovers the balances for the trading pair.
11. Checks if these tokens are available for trading (balance != null).
12. Loads the Cache class, used to recover market data in an optimized way.
13. Creates the bot inside the database if it does not exist, else loads it to update the values.

#### General Loop:
This loop is the less important one, it is used to update the values of the bot in the database
and do some basic checks, its interval is based on 4 times the timeframe of the main loop by default.

#### Main Loop:
This is the primary loop of the bot, this is where the magic happens.
This loop contains the RMS, itself containing the SP, and the trading system.

#### Historical Scoring System (HSS):
This system is used to calculate the score of a strategy based on its performance on historical data.

#### Risk Management System (RMS):
This fallback system used to prevent the SP from making stupid trades works on two basic systems:
- The profit calculator: This system is used to calculate the profit including fees of a trade,
  ensuring that only profitable trades are made by the SP.
- The stop loss: This system is used to prevent the bot from losing money if the SP is not performing well,
  meaning that the RMS is the only system that can, in fact, make the bot lose money.

#### Strategy Pool (SP):
This system contains all the strategies used to decide whether a trade should be made or not.
It is using the scoring system to weight the strategies, creating a basic governance system.