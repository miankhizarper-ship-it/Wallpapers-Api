const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://4kwallpapers.com';

async function getCategories() {
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);
    const categories = [];
    $('#categories-menu a').each((i, el) => {
        categories.push({
            name: $(el).text().replace(/\i.*/, '').trim(),
            url: $(el).attr('href'),
            slug: $(el).attr('href').replace(/\//g, '')
        });
    });
    return categories;
}

async function getList(url) {
    const { data } = await axios.get(url.startsWith('http') ? url : `${BASE_URL}${url}`);
    const $ = cheerio.load(data);
    const wallpapers = [];
    $('.wallpapers__item').each((i, el) => {
        const item = $(el);
        const title = item.find('a').attr('title');
        const link = item.find('a').attr('href');
        const thumb = item.find('img').attr('src');
        wallpapers.push({
            title,
            link,
            thumb: thumb ? `${BASE_URL}${thumb}` : null,
            id: link.match(/-(\d+)\.html$/)?.[1]
        });
    });
    return wallpapers;
}

// Search results page uses the exact same .wallpapers__item markup as listings,
// so we can reuse getList.
// Page 1:   /search/?q={query}
// Page 2+:  /search/{query}?page={n}   (matches the site's own infinite-scroll logic,
//            which rewrites "?q=x&page=2" into "/search/x?page=2")
async function search(query, page = 1) {
    if (!query || !query.trim()) throw new Error('Search query is required');

    // The site uses hyphenated slugs for multi-word queries (e.g. "anime girl" -> "anime-girl")
    const term = encodeURIComponent(query.trim().replace(/\s+/g, '-'));

    const url = page > 1
        ? `${BASE_URL}/search/${term}?page=${page}`
        : `${BASE_URL}/search/?q=${term}`;

    return getList(url);
}

async function getDetails(url) {
    try {
        const { data } = await axios.get(url.startsWith('http') ? url : `${BASE_URL}${url}`);
        const $ = cheerio.load(data);
        
        // Extracting details
        const title = $('h1').text();
        const description = $('.wall-intro').text();
        
        // Finding image URLs
        const downloadLinks = [];
        $('.wallpaper-resolutions a').each((i, el) => {
            const a = $(el);
            const href = a.attr('href');
            if (href && href.startsWith('/images/wallpapers/')) {
                downloadLinks.push({
                    resolution: a.text().split(' ')[0],
                    url: `${BASE_URL}${href}`
                });
            }
        });

        // Extracting tags
        const tags = [];
        $('.pic-right .tags a').each((i, el) => {
            tags.push($(el).text());
        });

        return {
            title,
            description,
            downloadLinks,
            tags
        };
    } catch (e) {
        console.error('4KWallpapers Detail Scraper Error:', e.message);
        throw e;
    }
}

module.exports = { getCategories, getList, getDetails, search };
