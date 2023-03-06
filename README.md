# Bibobot
A Python-based trading bot that leverages the volatility of the crypto market to make profits.


Technical summary
-----------------
The two services are the server (Python) and the client (NodeJS - TS).

The connection between the two services (Node for the interface & Python for the bot)
is ensured by an [RPC](https://www.zerorpc.io/). Allowing to connect the services
with a localhost URL instead of a more complex child process, and ensuring
a simpler communication system between services.