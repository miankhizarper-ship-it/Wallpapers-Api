const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fourKProvider = require('./providers/4kwallpapers');
const waProvider = require('./providers/wallpaperaccess');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({ exposedHeaders: ['X-Total-Pages'] }));
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Health Check
app.get('/', (req, res) => {
    res.json({ message: '4k-wallpapers API is running' });
});

const getProvider = (req) => {
    const providerName = req.query.provider;
    if (!providerName) throw new Error('Provider is mandatory. Use ?provider=4kwallpapers or ?provider=wallpaperaccess');
    if (providerName === 'wallpaperaccess') return waProvider;
    if (providerName === '4kwallpapers') return fourKProvider;
    throw new Error('Invalid provider');
};

// Builds listing URLs exactly the way the source site does:
//   page 1  ->  /anime/          (home listing -> /)
//   page 4  ->  /anime/?page=4   (home listing -> /?page=3)
const buildPageUrl = (path, page) => {
    const p = parseInt(page, 10) || 1;
    const clean = (path || '/').replace(/\/+$/, '');   // '' for home, '/anime'
    const base = clean === '' ? '/' : `${clean}/`;
    return p > 1 ? `${base}?page=${p}` : base;
};

// Sends a wallpaper list and exposes the total amount of pages
// scraped from the site's pagination bar as an X-Total-Pages header.
const sendList = (res, wallpapers) => {
    if (typeof wallpapers.totalPages === 'number') {
        res.set('X-Total-Pages', String(wallpapers.totalPages));
    }
    res.json(wallpapers);
};

// Routes are registered strictly before listen
app.get('/api/categories', async (req, res) => {
    try {
        const provider = getProvider(req);
        res.json(await provider.getCategories());
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/wallpapers', async (req, res) => {
    try {
        const provider = getProvider(req);
        const isWA = req.query.provider === 'wallpaperaccess';
        const url = isWA ? (req.query.slug || '') : buildPageUrl(req.query.slug || '', req.query.page);
        sendList(res, await provider.getList(url));
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/search', async (req, res) => {
    try {
        const provider = getProvider(req);
        const { q, page = 1 } = req.query;
        if (!q) throw new Error('Search query is mandatory. Use ?q={your-search-term}');
        if (typeof provider.search !== 'function') throw new Error('Search is not supported by this provider');
        sendList(res, await provider.search(q, parseInt(page, 10) || 1));
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/category/:slug', async (req, res) => {
    try {
        const provider = getProvider(req);
        const { slug } = req.params;
        const isWA = req.query.provider === 'wallpaperaccess';
        const url = isWA ? `/cat/${slug}` : buildPageUrl(`/${slug}`, req.query.page);
        sendList(res, await provider.getList(url));
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/wallpaper/:category/:slug', async (req, res) => {
    try {
        const provider = getProvider(req);
        const { category, slug } = req.params;
        const url = (req.query.provider === 'wallpaperaccess') ? `/${slug}` : `/${category}/${slug}`;
        res.json(await provider.getDetails(url));
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
