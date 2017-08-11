/* jshint esversion: 6 */

(() => {
    'use strict';

    const VERSION = "0.2.0";
    const PORT = 3000;
    const BASE_FOLDER = 'tokens';

    const fs = require('fs');
    const request = require('request');
    const express = require('express');
    const bodyParser = require('body-parser');
    const loki = require('lokijs');
    const app = express();

    const DB_NAME = 'tokens.db';
    const TOKEN_COLLECTION_NAME = 'tokens';
    const TOKEN_PACK_COLLECTION_NAME = 'token_packs';

    let DB;
    let TOKENS;
    let TOKEN_PACKS;

    initialize();

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    app.use(setCORS);

    app.post('/extract', handleExtractRoute);

    app.listen(PORT, () => {
        console.log(`Token Extractor (v${VERSION}) running on port ${PORT}!`);
    });

    function DOWNLOAD(uri, filename, callback) {
        request.head(uri, function(err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    }

    function handleExtractRoute(req, res) {
        let tokenPack = req.body.tokenPack;
        let tokenFileName = req.body.tokenName;
        let imageUrl = req.body.imageUrl;
        let tokenTags = req.body.tokenTags;

        // TODO: include token tags
        if (!tokenPack) {
            res.send('Error: No token pack provided');
        } else if (!tokenFileName) {
            res.send('Error: No token name provided');
        } else if (!imageUrl) {
            res.send('Error: No imageUri provided');
        } else {
            let tokenName = tokenFileName.replace(/_/g, ' ');
            let foundTokenPacks = TOKEN_PACKS.find({ 'name': tokenPack }); // DB Operation

            if (foundTokenPacks.length > 0) { // Folder already exist
                extractToken(res, tokenName, tokenFileName, tokenPack, tokenTags, imageUrl);
            } else {
                console.log(`[START] Creating the directory: '${BASE_FOLDER}/${tokenPack}'`);
                fs.mkdir(`${BASE_FOLDER}/${tokenPack}`, (err) => {
                    if (err) {
                        console.error(`[ERROR] Failed to create the directory: ${BASE_FOLDER}/${tokenPack}`);
                        console.error(err);
                    }
                    console.log(`[DONE] Directory: '${BASE_FOLDER}/${tokenPack}' created`);

                    extractToken(res, tokenName, tokenFileName, tokenPack, tokenTags, imageUrl);

                    // TODO: Find exsiting first. Consider duplicates
                    TOKEN_PACKS.insert({ name: tokenPack }); // DB Operation
                });
            }
        }
    }

    function extractToken(res, tokenName, tokenFileName, tokenPack, tokenTags, imageUrl) {
        let token = {
            tokenName: tokenName,
            tokenFileName: tokenFileName,
            tokenPack: tokenPack,
            tokenTags: tokenTags,
            imageUrl: imageUrl
        };

        // TODO: Find exsiting first. Consider duplicates

        console.log(`[START] Downloading: ${tokenFileName}.png`);
        DOWNLOAD(imageUrl, `${BASE_FOLDER}/${tokenPack}/${tokenFileName}.png`, () => {
            TOKENS.insert(token); // DB Operation

            // console.log(TOKENS.find({ 'tokenName': tokenName })); // FOR DEBUG ONLY
            console.log(`[DONE] Downloaded: ${tokenFileName}.png`);
            res.send('DONE');
        });
    }

    function initialize() {
        DB = new loki(DB_NAME, {
            autoload: true,
            autoloadCallback: databaseInitialize,
            autosave: true,
            autosaveInterval: 4000
        });

        fs.access(`${BASE_FOLDER}`, (err, a) => {
            if (err) {
                console.log(`[START] Creating the directory: ${BASE_FOLDER}`);
                fs.mkdir(`${BASE_FOLDER}`, (e) => {
                    if (e) {
                        console.error(`[ERROR] Failed to create the directory: ${BASE_FOLDER}`);
                        console.error(e);
                    }
                    console.log(`[DONE] Creating parent directory`);
                });
            }
        });
    }

    // Implement the autoloadback referenced in loki constructor
    function databaseInitialize() {
        TOKENS = DB.getCollection(TOKEN_COLLECTION_NAME);
        if (TOKENS === null) {
            TOKENS = DB.addCollection(TOKEN_COLLECTION_NAME, { 'unique': ["tokenFileName"] });
        }

        TOKEN_PACKS = DB.getCollection(TOKEN_PACK_COLLECTION_NAME);
        if (TOKEN_PACKS === null) {
            TOKEN_PACKS = DB.addCollection(TOKEN_PACK_COLLECTION_NAME, { 'unique': ["name"] });
        }

        // kick off any program logic or start listening to external events
        runProgramLogic();
    }

    // Example method with any bootstrap logic to run after database initialized
    function runProgramLogic() {
        console.log("Number of token in database : " + DB.getCollection(TOKEN_COLLECTION_NAME).count());
        console.log("Number of token packs in database : " + DB.getCollection(TOKEN_PACK_COLLECTION_NAME).count());
    }

    function setCORS(req, res, next) {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET POST');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    }

})();