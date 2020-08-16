const elasticlunr = require('elasticlunr');
const StreamArray = require('stream-json/streamers/StreamArray');
const fs = require('fs');
const moment = require('moment');


let loadAndSaveJSONtoIndex = function name(jsonStream, jsonFileName, indexFileName) {
    var idx = elasticlunr(function () {
        this.setRef('id');
        this.addField('title');
        this.addField('content');
    });

    fs.createReadStream(process.argv[2]).pipe(jsonStream.input);

    jsonStream.on('data', ({ key, value }) => {
        value.forEach(post => {
            idx.addDoc(post);
            console.log(post.title);
        });
    });

    jsonStream.on('end', () => {
        fs.writeFile(indexFileName, JSON.stringify(idx), function (err) {
            if (err) throw err;
            console.log(`Done! Index file saved successfully -> ${indexFileName}`);
        })
    });
};


(function () {
    let indexFileName = `./${moment().format('DDMMYYYYHHmmss')}_chedex_index.json`;
    loadAndSaveJSONtoIndex(StreamArray.withParser(), process.argv[2], indexFileName);
})();