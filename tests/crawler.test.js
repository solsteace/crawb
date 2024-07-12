import { test, expect} from "@jest/globals";
import {
    normalizeURL, 
    extractURLFromHTML, 
    crawlPage
} from "../dist/crawler";

test("Correctly normalize URLs by extracting its domain", () => {
    const cases = [
        ["https://blog.boot.dev/path/", "https://blog.boot.dev/path"],
        ["https://blog.boot.dev/path", "https://blog.boot.dev/path"],
        ["http://blog.boot.dev/path/", "http://blog.boot.dev/path"],
        ["http://blog.boot.dev/path", "http://blog.boot.dev/path"],
    ]
    cases.forEach(([testCase, expected]) => {
        expect(normalizeURL(testCase)).toBe(expected)
    })
})

test("Correctly extract absolute urls from given HTML", () => {
    const cases = [
        [
            ["<!DOCTYPE html><p>Hello world</p>", ""],
            []
        ],
        [
            ["<a href='https://boot.dev'>Learn Backend Development</a>", "https://boot.dev"],
            ["https://boot.dev/"],
        ],
        [
            [
                [
                    "<div>",
                        "<a href='https://boot.dev'>Learn Backend Development</a>",
                        "<a href='https://boot.dev/'>Learn Backend Development</a>",
                        "<a href='https://boot.dev/path'>Learn Backend Development</a>",
                        "<a href='https://boot.dev/path/'>Learn Backend Development</a>",
                    "</div>",
                ].join(""),
                "https://boot.dev/"
            ],
            [
                "https://boot.dev/",
                "https://boot.dev/",
                "https://boot.dev/path",
                "https://boot.dev/path/",
            ]
        ]
    ]

    cases.forEach(([testCase, expected]) => {
        const [caseHTML, caseBaseURL] = testCase
        const allURLExists = extractURLFromHTML(caseHTML, caseBaseURL)
                                .every(url => expected.includes(url))
        expect(allURLExists).toBe(true)
    })
})

test("Correctly extract a mix of absolute and relative URLs from given HTML", () => {
    const cases = [
        [   
            [
                [
                    "<div>",
                        "<a href='http://boot.dev/path'>Learn Backend Development</a>",
                        "<a href='http://boot.dev/path/'>Learn Backend Development</a>",
                        "<a href='/path'>Learn Backend Development</a>",
                        "<a href='/path/'>Learn Backend Development</a>",
                    "</div>",
                ].join(""),
                "http://boot.dev/"
            ],
            [
                "http://boot.dev/path",
                "http://boot.dev/path/",
                "http://boot.dev/path",
                "http://boot.dev/path/",
            ]
        ]
    ]                
    cases.forEach(([testCase, expected]) => {
        const [caseHTML, caseBaseURL] = testCase
        const allURLExists = extractURLFromHTML(caseHTML, caseBaseURL)
                                .every(url => expected.includes(url))
        expect(allURLExists).toBe(true)
    })
})

// Since this test is time consuming, comment if this module weren't changed 
test("Discover all pages within the domain", async() => {
    const cases = [
        [   
            "https://wagslane.dev/",
            [
                `https://wagslane.dev`,
                `https://wagslane.dev/about`,
                `https://wagslane.dev/index.xml`,
                `https://wagslane.dev/posts/zen-of-proverbs`,
                `https://wagslane.dev/posts/college-a-solution-in-search-of-a-problem`,
                `https://wagslane.dev/posts/guard-keyword-error-handling-golang`,
                `https://wagslane.dev/posts/no-one-does-devops`,
                `https://wagslane.dev/posts/developers-learn-to-say-no`,
                `https://wagslane.dev/posts/dark-patterns`,
                `https://wagslane.dev/posts/func-y-json-api`,
                `https://wagslane.dev/posts/seo-is-a-scam-job`,
                `https://wagslane.dev/posts/things-i-dont-want-to-do-to-grow-business`,
                `https://wagslane.dev/posts/what-a-crazy-religion`,
                `https://wagslane.dev/posts/collapsing-quality-of-devto`,
                `https://wagslane.dev/posts/keep-your-data-raw-at-rest`,
                `https://wagslane.dev/posts/continuous-deployments-arent-continuous-disruptions`,
                `https://wagslane.dev/posts/kanban-vs-scrum`,
                `https://wagslane.dev/posts/gos-major-version-handling`,
                `https://wagslane.dev/posts/optimize-for-simplicit-first`,
                `https://wagslane.dev/posts/go-struct-ordering`,
                `https://wagslane.dev/posts/managers-that-cant-code`,
                `https://wagslane.dev/posts/leave-scrum-to-rugby`,
                `https://wagslane.dev/posts/a-case-against-a-case-for-the-book-of-mormon`,
                `https://wagslane.dev/tags`,
                `https://wagslane.dev/tags/business`,
                `https://wagslane.dev/tags/clean-code`,
                `https://wagslane.dev/tags/devops`,
                `https://wagslane.dev/tags/education`,
                `https://wagslane.dev/tags/golang`,
                `https://wagslane.dev/tags/management`,
                `https://wagslane.dev/tags/philosophy`,
                `https://wagslane.dev/tags/writing`
            ]
        ]
    ]                
    for(let idx = 0; idx < cases.length; idx++) {
        const [testCase, expected] = cases[idx]
        try {
            const urls = await crawlPage(testCase).then(res => res)
            const allURLExists = Object.keys(urls)
                                    .every(url => expected.includes(url))
            expect(allURLExists).toBe(true)
        } catch(err) { console.log(err) }
    }
}, 6e5)