/* jshint esversion: 6 */

(() => {
    'use strict';

    const VERSION = "0.0.2";
    const PORT = 3000;
    const BASE_PATH = 'tokens/';

    const fs = require('fs');
    const request = require('request');
    const express = require('express');
    const bodyParser = require('body-parser');
    const app = express();

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    // Add headers
    app.use(function(req, res, next) {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });

    app.post('/extract', (req, res) => {
        let tokenPack = req.body.tokenPack;
        let tokenFileName = req.body.tokenName;
        let imageUrl = req.body.imageUrl;

        // TODO: include token tags
        if (!tokenPack) {
            res.send('Error: No token pack provided');
        } else if (!tokenFileName) {
            res.send('Error: No token name provided');
        } else if (!imageUrl) {
            res.send('Error: No imageUri provided');
        } else {
            let tokenName = tokenFileName.replace(/_/g, ' ');

            // TODO
            // 1. Check if folder (via token pack) exist
            // 2. Check if token (via token name) exist
            // 3. Save file to JSON

            console.log(`[START] Downloading: ${tokenFileName}.png`);
            DOWNLOAD(imageUrl, `${tokenFileName}.png`, () => {
                console.log(`[DONE] Downloaded: ${tokenFileName}.png`);
                res.send('DONE');
            });
        }
    });

    app.listen(PORT, function() {
        console.log(`Token Extractor (v${VERSION}) running on port ${PORT}!`);
    });

    let DOWNLOAD = function(uri, filename, callback) {
        request.head(uri, function(err, res, body) {
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);

            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

})();