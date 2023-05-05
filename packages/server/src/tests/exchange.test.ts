import { expect } from "chai";
import { describe, it } from "mocha";

import * as exchange from "helpers/exchange";


describe("exchange.ts", () => {
    describe("parseTradingPair", () => {
        it("Should give an object.", () => {
            expect(exchange.parseTradingPair("BTC/USDT"))
                .is.an("object");
        });

        it("Should give the proper object.", () => {
            expect(exchange.parseTradingPair("BTC/USDT"))
                .is.eql({ base: "BTC", quote: "USDT" });
        });
    });

    describe("loadExchange()", () => {
        it("Should give an object.", () => {
            expect(exchange.loadExchange(true))
                .is.an("object");
        });
    });

    //TODO: Pas compris comment tester toute la fonction
    describe("checkExchangeStatus()", () => {
        it("Should give a boolean.", async () => {
            expect(await exchange.checkExchangeStatus(exchange.loadExchange(true)))
                .is.a("boolean");
        });

        it("Should give the proper boolean in sandbox mode.", async () => {
            expect(await exchange.checkExchangeStatus(exchange.loadExchange(true)))
                .is.eql(true);
        });

        it("Should give the proper boolean without sandbox mode on.", async () => {
            expect(await exchange.checkExchangeStatus(exchange.loadExchange(false)))
                .is.eql(true);
        });
    });

    // TODO: Pas compris
    describe("loadMarkets()", () => {
        it("Should give an object.", async () => {
            expect(await exchange.loadMarkets(exchange.loadExchange(true)))
                .is.an("object");
        });
    });

    describe("loadBalances()", () => {
        it("Should give an object.", async () => {
            expect(await exchange.loadBalances(exchange.loadExchange(true)))
                .is.an("object");
        });
    });

    //TODO: Pas compris l'erreur
    // describe.only("getBalance()", () => {
    //     it("Should give a number.", async () => {
    //         expect(await exchange.getBalance(exchange.loadExchange(true)
    //             , "BTC"))
    //             .is.a("number");
    //     });
    // });

    //TODO: Timeout
    // describe("fetchTicker()", () => {
    //     it("Should give an object.", async () => {
    //         expect(await exchange.fetchTicker(exchange.loadExchange(true), "BTC/USDT"))
    //             .is.an("object");
    //     });
    // });

    // describe("fetchOrderBook()", () => {
    //     it("Should give an object.", async () => {
    //         expect(await exchange.fetchOrderBook(exchange.loadExchange(true), "BTC/USDT"))
    //             .is.an("object");
    //     });
    // });

    // describe("fetchTrades()", () => {
    //     it("Should give an array.", async () => {
    //         expect(await exchange.fetchTrades(exchange.loadExchange(true), "BTC/USDT"))
    //             .is.an("array");
    //     });
    // });

    // describe("fetchOHLCV()", () => {
    //     it("Should give an array.", async () => {
    //         expect(await exchange.fetchOHLCV(exchange.loadExchange(true), "BTC/USDT"))
    //             .is.an("array");
    //     });
    // });

    // describe("precalculateFees()", () => {
    //     it("Should give an object.", async () => {
    //         expect(await exchange.precalculateFees(exchange.loadExchange(true), "BTC/USDT", "market", "buy", 0.001))
    //             .is.an("object");
    //     });
    // });

    describe("exchangeTimeDifference()", () => {
        it("Should give a number.", async () => {
            expect(await exchange.exchangeTimeDifference(exchange.loadExchange(true)))
                .is.a("number");
        });
    });
});