import { expect } from "chai";
import lodash from "lodash";
import { describe, it } from "mocha";
import { Db } from "mongodb";

import { botObject } from "configs/bot.config";
import { NETWORK_CONFIG } from "configs/global.config";
import { getObjectId } from "helpers/inputs";
import * as network from "helpers/network";
import logger from "utils/logger";
import { generateRandomBotName, generateRandomNumber } from "utils/random";


// Silencing the logger
logger.transports.forEach((t) => (t.silent = true));


// MEGA TODO DE LA MORT QUI TUE:
// Quand tu te connecte à la DB, tu dois fermer la connexion à la fin du test
// Sinon ça va te faire des erreurs de connexion à la DB quand tu va lancer plusieurs tests
// (Car tu va essayer de te connecter plusieurs fois à la DB en même temps)
// cette fonction est faite pour ça:
// network.closeDBConnection();
// mais utilise closeDBConnection() à la fin de chaque test qui utilise la DB
// By the way, tu peux utiliser la fonction "afterEach" de mocha pour ça,
// C'est comme beforeEach mais ça s'exécute après chaque test


// TODO: Tu pensera à enlever tout les commentaires que j'ai mis pour t'expliquer


// TODO: Tu peux rajouter des messages d'erreur dans les "expect" pour que ce soit plus clair
// Met les "Should" en majuscule
// Essaie de te baser sur les tests que j'ai fait là pour faire les tiens

// TODO: On verra en appel qu'est ce que tu as loupé d'autres mais là flemme de continuer, bruh, c'est 2h41,
// je travaille comme jaja demain, c'est la mort là
// Sinon bien ouej pour les tests, il y as pas mal de trucs à refaire mais je te fais confiance pour ça mon reuf

describe("network.ts", () => {
    // Comme tu te sert du nom "timmy", c'est pas ouf car il faut modifier le test à chaque lancement
    // Donc on fait ici une variable qui va contenir le nom du bot (random a chaque lancement de test)
    // J'ai crée une fonction dans "utils/random.ts" qui fait ça
    // On l'assigne à la variable "botName" ici pour le nom qui doit être utilisé deux fois
    // (Quand on envoie puis récupère le bot dans la DB)
    const randomBotName = generateRandomBotName();

    describe("checkNetwork()", () => {
        it("Should return a boolean, depending if the network test has successfully passed or not", async () => {
            expect(await network.checkNetwork(false))
                .is.a("boolean");
        });
    });

    describe("connectToDB()", () => {
        let mongoDB: Db | null;

        beforeEach(async () => {
            // Assign the DB instance to the mongoDB variable
            ({ mongoDB } = await network.connectToDB(false, "tests"));
        });

        it("Should return 'null' if the connection fails (wrong database name)", async () => {
            const { mongoDB } = await network.connectToDB(false, "wrongDBName");

            expect(mongoDB, "MongoDB instance should be null")
                .is.null;
        });

        it("Should return the DB instance if connected successfully", async () => {
            if (mongoDB !== null) {
                expect(mongoDB, "MongoDB instance should be an object")
                    .is.a("object");
            }
        });

        it(`Should return the DB instance containing the '${NETWORK_CONFIG.botObjectsCollection}' collection`, async () => {
            if (mongoDB !== null) {
                // Get the list of collections and their names
                const collections = await mongoDB.collections();
                const collectionNames = collections.map((collection) => collection.collectionName);

                expect(collectionNames.includes(NETWORK_CONFIG.botObjectsCollection), "The collection name should be in the list of collections")
                    .to.be.true;
            }
        });
    });

    // TODO
    describe("checkBotObjectExistenceInDB()", () => {
        // On déclare la variable ici, et on l'assigne dans le "beforeEach"
        let mongoDB: Db | null;

        // Comme c'est un objet qui est retourné, on met entre parenthèses
        // pour direct récupérer la variable "mongoDB" et pas l'objet
        beforeEach(async () => {
            // Assign the DB instance to the mongoDB variable
            ({ mongoDB } = await network.connectToDB(false, "tests"));
        });

        // Note: on se fout du "try/catch" ici, on veut juste tester la fonction,
        // donc on doit tester la variable botIdentifier uniquement (et pas le fait que la fonction se connecte à la DB)
        // Donc ça donnerait:

        it("Should return a boolean, depending if the bot object exists or not", async () => {
            // TODO: Donc là on teste que ça retourne un boolean, mais on ne teste pas le contenu du boolean

            // Uniquement si la DB est connectée (donc si elle n'est pas null)
            if (mongoDB !== null) {
                // On teste avec un botIdentifier qui n'existe pas
                const botExists = await network.checkBotObjectExistenceInDB(mongoDB, "botIdentifier");

                // On vérifie juste que ça retourne un boolean
                expect(botExists, "The returned value should be a boolean")
                    .is.a("boolean");
            }
        });

        // TODO: Et là on teste le contenu du boolean

        it("Should return 'false' if there's no bot object with this ID", async () => {
            if (mongoDB !== null) {
                // On teste avec un botIdentifier qui n'existe pas
                const botExists = await network.checkBotObjectExistenceInDB(mongoDB, "botIdentifier");

                // On vérifie que ça retourne false
                expect(botExists, "The bot should not exist in the DB")
                    .is.false;
            }
        });

        // Ici, on veut donc un botIdentifier qui existe
        // On doit donc le créer dans la DB avant de tester la fonction
        // En utilisant "getRandomBotName()" pour avoir un nom aléatoire
        // En le gardant dans une variable pour pouvoir l'utiliser dans le test
        it("Should return 'true' if there's a bot object with this ID", async () => {
            if (mongoDB !== null) {
                // On ajoute le bot dans la DB
                // TODO: Tu peux utiliser la fonction "sendInitialBotObjectToDB" pour ça
                // Sers toi d'un randomBotName pour le nom du bot, stocké dans une variable
                // (Pour pouvoir l'utiliser dans le test)

                // On teste avec un botIdentifier qui existe
                // TODO: Utilise du coup la variable du randomBotName ici
                const botExists = await network.checkBotObjectExistenceInDB(mongoDB, "timmy");

                // On vérifie que ça retourne true
                expect(botExists, "The bot should exist in the DB")
                    .is.true;
            }
        });
    });

    describe("sendInitialBotObjectToDB()", () => {
        // TODO: Tu peux faire un beforeEach ici pour te connecter à la DB
        // Regarde le test de "checkBotObjectExistenceInDB" pour voir comment faire
    });

    describe("getBotObjectFromDB()", () => {
        // TODO: Tu peux faire un beforeEach ici pour te connecter à la DB
        // Regarde le test de "checkBotObjectExistenceInDB" pour voir comment faire

        it("Should return the bot object", async () => {
            const { mongoDB } = await network.connectToDB(false, "tests");

            if (mongoDB !== null) {
                const testBotObject = lodash.cloneDeep(botObject);
                // On génère un nom aléatoire pour le bot (pour pas avoir à modifier le test à chaque fois)
                // Enlève ce commentaire et les deux retours à la ligne (#maniaque)
                const botName = generateRandomBotName();
                const sandbox = true;

                testBotObject.start.name = botName;
                testBotObject.start.id = getObjectId(sandbox, testBotObject.start.name);
                testBotObject.start.sandbox = sandbox;

                // TODO: ça c'est pas bon, tu dois utiliser "getBotObjectFromDB" puisque c'est la fonction que tu testes..
                const sendOrGet = network.sendOrGetInitialBotObject(mongoDB, testBotObject);

                expect((await sendOrGet).start.name)
                    .is.equal(botName);
            }
        });
    });

    describe("sendOrGetInitialBotObject()", () => {

        // TODO: Tu peux faire un beforeEach ici pour te connecter à la DB
        // Regarde le test de "checkBotObjectExistenceInDB" pour voir comment faire

        it("Should return the name of the bot", async () => {
            const { mongoDB } = await network.connectToDB(false, "tests");

            if (mongoDB !== null) {
                const testBotObject = lodash.cloneDeep(botObject);
                const botName = randomBotName;
                const sandbox = true;

                testBotObject.start.name = botName;
                testBotObject.start.id = getObjectId(sandbox, testBotObject.start.name);
                testBotObject.start.sandbox = sandbox;

                const sendOrGet = network.sendOrGetInitialBotObject(mongoDB, testBotObject);

                expect((await sendOrGet).start.name)
                    .is.equal(botName);
            }
        });

        it("Should return the same bot object", async () => {
            const { mongoDB } = await network.connectToDB(false, "tests");

            if (mongoDB !== null) {
                const testBotObject = lodash.cloneDeep(botObject);
                const botName = randomBotName;
                const sandbox = true;

                testBotObject.start.name = botName;
                testBotObject.start.id = getObjectId(sandbox, testBotObject.start.name);
                testBotObject.start.sandbox = sandbox;

                const sendOrGet = network.sendOrGetInitialBotObject(mongoDB, testBotObject);

                // TODO: le problème ici, c'est que si le bot n'existe pas, tu test le nom,
                // mais si le bot existe, tu teste aussi le nom, donc comment savoir si c'est le même bot ou pas ?
                // Il faut que tu testes le contenu du bot, pas juste le nom,
                // par exemple dans le test au dessus, change aussi "start.initialQuoteBalance" par une valeur random
                // que tu stockes dans une variable, et ici, tu testes que la valeur est la même
                // je t'ai fait une fonction pour ça aussi dans "utils/random", "generateRandomNumber"
                // Et ici laisse la valeur par défaut
                // Comme ça, si par exemple start.initialQuoteBalance = 0, ça veut dire que c'est un nouveau bot
                // Et si start.initialQuoteBalance = 1000, ça veut dire que c'est le même bot
                // Mais tu peux pas juste mettre "1000" car de nouveau, les tests suivants
                // pourraient prendre le mauvais bot et tu ne pourrais pas savoir puisque toutes les valeurs seraient à 1000
                expect((await sendOrGet).start.name)
                    .is.equal(botName);
            }
        });
    });
});
