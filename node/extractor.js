const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

const baseUrl = 'http://chedet.cc';
const axiosConfig = {
    timeout: 60000
};

var getPostListingByPage = function name(pageNumber = 1) {
    return new Promise(function (resolve, reject) {
        axios.get(`${baseUrl}/?paged=${pageNumber}`, axiosConfig)
            .then(function (response) {
                const $ = cheerio.load(response.data);
                var postList = [];
                
                $('.type-post').each((id, el) => {
                    var post = {};
                    post.title = $(el).find('h2 > a[title]').text();
                    post.url = $(el).find('h2 > a[title]').attr('href');
                    post.category = $(el).find('p.post-categories').text();

                    postList.push(post);
                });

                resolve(postList);
            })
            .catch(function (error) {
                reject(error);
            })
            .finally(function () {
                // always executed
            });
    });
}

var getPostContentByUrl = function name(postList) {
    return new Promise(function (resolve, reject) {
        var promiseArray = [];

        postList.forEach((post, index) => {
            promiseArray.push(new Promise((resolve, reject) => {
                axios.get(post.url, axiosConfig)
                    .then(function (response) {
                        const $ = cheerio.load(response.data);
                        post.content = $('div.post-bodycopy > div > p').text();
                        post.date = $('div.post-footer').text().trim();
                        resolve(post);

                    })
                    .catch(function (error) {
                        reject(error);

                    })
                    .finally(function () {
                        // always executed
                    });
            }));
        });

        resolve(Promise.all(promiseArray));
    });
};

(function () {
    var totalPageNumber = 10;

    for (let pageNumber = 1; pageNumber <= totalPageNumber; pageNumber++) {
        getPostListingByPage(pageNumber)
            .then((resultPostListing) => {
                return getPostContentByUrl(resultPostListing);

            }).then((resultWithPostContent) => {
                console.log(resultWithPostContent);
                var fileName = `page_${pageNumber}.json`;

                fs.writeFile(fileName, JSON.stringify(resultWithPostContent), function (err) {
                    if (err) return console.log(err);

                    console.log(`Result for page ${pageNumber} > ${fileName}`);
                });
            });
    }
})();
