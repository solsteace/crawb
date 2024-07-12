import {JSDOM} from "jsdom";

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
    return `${urlObj.host}${strippedPathname}`;
}

// Optimizable using tree for visited page searching?
export const crawlPage = async function(currentUrl: string, VISITED_PAGES: Array<string> = []): Promise<Array<string>> {
    if(!VISITED_PAGES.includes(currentUrl)) {
        VISITED_PAGES.push(currentUrl)
        const pages = await fetch(currentUrl, {
                headers: { "content-type": "text/html" }
            })
            .then(res => {
                if(res.status == 404) return ""
                return res.text()
            })
            .then(html => extractURLFromHTML(html, currentUrl) as Array<string>)
            .catch(err => {throw `Error while crawling: ${currentUrl}: ${err}`})

        // Let relative path not on `currentUrl` handled by their own absolute path exploration
        const pagesToVisit = pages.filter(url => ( url.substring(0, currentUrl.length) == currentUrl ))
        for(let idx = 0; idx < pagesToVisit.length; idx++) {
            await crawlPage(pagesToVisit[idx], VISITED_PAGES)
                .then(num => num)
                .catch(err => {throw err})
        }
    }
    return VISITED_PAGES
}