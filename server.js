'use strict';

const fs = require("fs");
const elasticlunr = require("elasticlunr");
const Hapi = require('@hapi/hapi');
const chedex = require('./elasticlunr_search');

const init = async () => {

    const server = Hapi.server({
        port: process.argv[2] || 3030
        //host: 'localhost'
    });

    // Load index dump
    let indexData = fs.readFileSync("./23082020004011_chedex_index.json");
    let indexDump = JSON.parse(indexData);
    let idx = elasticlunr.Index.load(indexDump);

    

    //console.log(idx);

    server.route({
        method: 'GET',
        path: '/search/{keyword}',
        config: {
            cors: {
                origin: ['*'],
                additionalHeaders: ['cache-control', 'x-requested-with']
            }
        },
        handler: (request, h) => {
            let results = chedex.search(idx, request.params.keyword).map((val, i) => {
                val.doc = idx.documentStore.getDoc(val.ref);
                //console.log(idx.documentStore.getDoc(val.ref));
                return val;
            });
            return results;
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();