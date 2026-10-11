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
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

const getProvider = (req) => {
    const providerName = req.query.provider;
    if (!providerName) throw new Error('Provider is mandatory. Use ?provider=4kwallpapers or ?provider=wallpaperaccess');
    if (providerName === 'wallpaperaccess') return waProvider;
    if (providerName === '4kwallpapers') return fourKProvider;
    throw new Error('Invalid provider');
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
        res.json(await provider.getList(req.query.slug || ''));
    } catch (e) { res.status(400).json({ error: e.message }); }
});

app.get('/api/category/:slug', async (req, res) => {
    try {
        const provider = getProvider(req);
        const { slug } = req.params;
        const page = req.query.page || 1;
        const url = (req.query.provider === 'wallpaperaccess') ? `/cat/${slug}` : `/${slug}/?page=${page}`;
        res.json(await provider.getList(url));
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
