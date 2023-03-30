# Bibobot
A Typescript-based trading bot that leverages the volatility of the crypto market to make profits.


Technical summary
-----------------
The two services (monorepo with Yarn workspaces) are the server (TS Node) and the client (React - TS).


The parts
-------------
This bot is separated into 3 parts:
- The first part is the **bot initialization** which ensures proper network & exchange connections.

- The second part is the **secure order system**, this part is mainly charged to call the strategy pool for an answer concerning the decision to make while ensuring that this decision is profitable. it fetches the last ticker and ensure profits while including the transaction fees. It also implements a stop-loss system ([Trailing stop loss ~20%](https://www.quant-investing.com/blog/truths-about-stop-losses-that-nobody-wants-to-believe)).

- The third part called the **strategy pool** which is the actual controller of the bot, it works by implementing multiple algorithms with different strategies and allowing them to vote, a weight voting will later be implemented allowing some fine-tuning of the bot.


Loop system
-----------
The bot runs into multiple loops, the reason for that is that the synchronization with the database don't have to be at the same time
nor in the same loop iteration as the controller of the bot.

The **main loop** implements the logic for the secure order system and the strategy pool, its timing is defined by the timeframe parameter of the bot class.

The **general loop** implements the synchronization system with the MongoDB database, it works by checking the existence of a bot with the same ID as the hash of the provided name parameter (+ `-sandbox` if in sandbox mode) and send initial data or recover & update existing data. Its timing is defined as X times the main loop timeframe (by default, it's 2).

It's important to note that the main loop iteration internal time is measured using `performance.now()`, so the internal time is subtracted from the final loop time for a better overall precision.


Bot initialization
------------------
Here's a sorted list of all the steps used by the bot during initialization to ensure its good function and to recover initial data.

`*` means that this feature is skipped in Sandbox mode for speed or API availability reasons.

- The trading pair in sandbox mode is replaced by the one inside `global.config.ts` as the Binance sandbox API don't provide a wallet with a lot of different tokens inside of it.
- `*` Warning with an user input for non-sandbox mode (reply `y` to continue, or any other char to stop the bot).
- `*` Check the network overall quality, the min/max values to pass the test can be found inside `global.config.ts`, these values are the download and upload speed, the latency and the jitter of the network. Note that the download and upload speed are limited to 10 Mo/s by the API so it's normal if the results don't show a better connection than that.
- Connect to the MongoDB database.
- Load the exchange (with sandbox or real mode which is a parameter of the exchange loading function).
- `*` Check the exchange status (Not available with Binance Sandbox API).
- Load the markets from the Binance API.
- Measure the difference of time between the Binance API servers and the local time, note that to improve the overall precision of the test, a `performance.now()` measures the time that the await function takes, for now, it's just to have a general idea of the latency.
- Load all the balances from the Binance account linked to the API.
- Get the balances depending on the actual trading pair used (base/quote).
- Check the existence of these balances.
- Handle the statistics with the database (create new ones or recover existing ones from the bot ID).


Secure order system
-------------------
This part is mainly charged to call the strategy pool for an answer concerning the decision to make while ensuring that this decision is profitable.

It implements two main methods to prevent wrong decisions:
- A stop-loss system used to prevent the bot for keeping its position too long ([Trailing stop loss ~20%](https://www.quant-investing.com/blog/truths-about-stop-losses-that-nobody-wants-to-believe)).
- A profit calculator, checking that the profits are always > 0 while including the fees.

**Note that these two methods should be ONLY considered as fallbacks for the strategy pool.**

This part actually corresponds to the `main loop` of the bot.


Strategy pool
-------------
The strategy pool is based on a voting system for each implemented algorithm, so each can decide whenever to buy/sell or stay, the final decision depending on the majority. This part is implemented on top of the secure order system.

`NOTE:` I plan to implement a weighted voting strategy: each algorithm will be tested individually, allowing me to obtain a general performance score, then, depending on how well the algorithm performed on multiple sets of data, the algorithm could count a more than one vote, making this algorithm more important than the others.


Bot statistics
--------------
The statistics are stored inside a MongoDB database, the identifier set when creating a new bot is hashed using the `crypto` package.

The hash will be different for bots in sandbox mode as the suffix `-sandbox` is added to the name before hashing. If the hash already exists inside the database, the bot will recover the previous statistics and update them, if not, it will send new statistics.

In conclusion, the name of a bot can be kept between sandbox & real mode without any issue.

In a technical perspective, I decided to make an unique object called `BotObject` that stores all different types of data stored inside sub-categories:
- `start`: Sent to the database when the bot is started (overriding the data inside the DB).
- `stop`: Sent to the database when the bot is stopped (overriding the data inside the DB).
- `shared` Shared with the database (recovered from the DB then updated).
- `local` Not shared with the database (only used locally).
- `specials` Special data not matching other categories.