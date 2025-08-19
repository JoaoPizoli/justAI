from crawl4ai import AsyncWebCrawler # type: ignore

async def scrape(url):
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url)
        print(result.markdown)
    return result.markdown


