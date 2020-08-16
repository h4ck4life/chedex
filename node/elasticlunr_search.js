const fs = require('fs');
const elasticlunr = require('elasticlunr');

let indexData = fs.readFileSync('16082020234001_chedex_index.json');

var indexDump = JSON.parse(indexData);
let idx = elasticlunr.Index.load(indexDump);

console.log(idx.search(process.argv[2], {
    fields: {
        title: { boost: 1 },
        content: { boost: 2}
    },
    bool: "AND",
    expand: false
}));

