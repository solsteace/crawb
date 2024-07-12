import {argv, exit} from "node:process";
import { 
    crawlPage,
    extractURLFromHTML, 
    normalizeURL
} from "./dist/crawler.js";

const main = function() {
    if(argv.length != 3) {
        console.log("Usage: node ./index.js <baseURL>")
        exit();
    }

    const baseUrl = argv.at(2)
    crawlPage(baseUrl.at(-1) == "/"? baseUrl: `${baseUrl}/`)
        .then(res => console.log(res))
        .catch(err => console.log(err))
}

main()