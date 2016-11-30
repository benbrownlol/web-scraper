# Web Scraper Implementation Idea

1. Visit the url entered by user.
2. Search for all href links and src links on the page.
3. Add src links to final object and add href links (if from same domain) to queue array.
4. When finished scraping page move to next url in the queue, add scraped url to array for checking so that pages are not scraped more than once.
5. Once queue is empty, print final object to console.
