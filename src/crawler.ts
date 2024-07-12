import {JSDOM} from "jsdom";
import { PageStats } from "./pageStats.js";

interface Page {
    isVisited: boolean,
    stats: PageStats   
}

export const extractURLFromHTML = function(htmlBody: string, baseUrl: string): object {
    const dom = new JSDOM(htmlBody);
    const anchorNodes = dom.window.document.getElementsByTagName("a");

    // Handle relative urls
    return Array.from(anchorNodes)
        .map(node =>  {
            let url = (node as HTMLAnchorElement).href
            const isRelativeURL = url.at(0) == "/" || url.at(0) == "."
            if(isRelativeURL) {
                const urlObj = new URL(baseUrl)
                url = (url.at(0) == "." ? `${baseUrl}${url.substring(2)}` 
                                        : `${urlObj.protocol}//${urlObj.host}${url}`)
            }
            return url
        })
}

export const normalizeURL = function(url: string) : string {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname
    const strippedPathname = (pathname[pathname.length - 1] != "/" ?
                            pathname: pathname.substring(0, pathname.length - 1 ))
    return `${urlObj.protocol}//${urlObj.host}${strippedPathname}`;
}

// Optimizable using tree for visited page searching?
export const crawlPage = async function(currentUrl: string, VISITED_PAGES: {[key: string]: Page} = {}):  Promise<object> {
    currentUrl = normalizeURL(currentUrl)
    const visitedPageUrls = Object.keys(VISITED_PAGES)
                                .filter(page => VISITED_PAGES[page].isVisited)

    if(!visitedPageUrls.includes(currentUrl)) {
        visitedPageUrls.push(currentUrl)
        VISITED_PAGES[currentUrl] = { 
            isVisited: true,
            stats: {
                internalLinks: 0, 
                externalLinks: 0 
            }
        }

        const pages = await fetch(currentUrl, {
                headers: { "content-type": "text/html" }
            })
            .then(res => {
                if(res.status == 404) return ""
                return res.text()
            })
            .then(html => extractURLFromHTML(html, currentUrl) as Array<string>)
            .catch(err => {throw `Error while crawling: ${currentUrl}: ${err}`})

        // Calculate internal and external links
        pages.forEach(page => {
            const pageUrl = normalizeURL(page)
            const sameOrigin = new URL(currentUrl).host == new URL(pageUrl).host
            if(sameOrigin) VISITED_PAGES[currentUrl].stats.internalLinks++
            else VISITED_PAGES[currentUrl].stats.externalLinks++
        })

        for(let idx = 0; idx < pages.length; idx++) {
            const pageUrl = pages[idx]
            const shouldBeVisited = (
                new URL(currentUrl).host == new URL(pageUrl).host
                && !visitedPageUrls.includes(pageUrl)
            )

            if(shouldBeVisited) {
                await crawlPage(pageUrl, VISITED_PAGES)
                    .then(num => num)
                    .catch(err => {throw err})
            }
        }
    }
    return VISITED_PAGES
}