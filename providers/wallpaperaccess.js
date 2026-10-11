const puppeteer = require('puppeteer');

// Launch browser once to keep it running for better performance
let browser = null;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
    }
    return browser;
}

async function getList(slug) {
    const url = slug ? `https://wallpaperaccess.com/${slug}` : 'https://wallpaperaccess.com/';
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const wallpapers = await page.evaluate(() => {
            const items = [];
            // Target the collection thumbnails as seen in your provided source
            document.querySelectorAll('.collection_thumb').forEach(el => {
                const a = el.querySelector('a');
                const img = el.querySelector('img');
                
                if (a && img) {
                    items.push({
                        title: a.getAttribute('title')?.replace(' Wallpapers', ''),
                        link: a.getAttribute('href')?.replace(/^\//, ''),
                        thumb: img.getAttribute('data-src') || img.getAttribute('src')
                    });
                }
            });
            return items;
        });
        
        return wallpapers;
    } catch (e) {
        console.error('WallpaperAccess Scraper Error:', e.message);
        throw e;
    } finally {
        await page.close();
    }
}

async function getDetails(slug) {
    const url = `https://wallpaperaccess.com/${slug}`;
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const details = await page.evaluate(() => {
            const title = document.querySelector('h1')?.innerText;
            // Adjust this selector based on actual inspection of the detail page
            const downloadLink = document.querySelector('.download-button')?.getAttribute('href');
            
            return {
                title,
                downloadLink
            };
        });
        
        return {
            ...details,
            downloadLink: details.downloadLink ? `https://wallpaperaccess.com${details.downloadLink}` : null
        };
    } catch (e) {
        console.error('WallpaperAccess Detail Scraper Error:', e.message);
        throw e;
    } finally {
        await page.close();
    }
}

module.exports = { getCategories: async () => [], getList, getDetails };