export interface PageStats {
    internalLinks: number,
    externalLinks: number,
}

export const displayStats = function(pages: object): void {
    Object.entries(pages)
        .sort((op1, op2) => op2[1].stats.internalLinks - op1[1].stats.internalLinks)
        .forEach(([pageUrl, _]) => {
            const {internalLinks, externalLinks} = pages[pageUrl].stats
            console.log([ 
                pageUrl,
                `Internal links: ${internalLinks}`,
                `External links: ${externalLinks}\n`
            ].join("\n"))
        })
}