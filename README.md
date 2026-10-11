# 4K Wallpaper API

A professional, multi-provider wallpaper scraping API built with Express.js.

## API Documentation

All API requests **must** include the mandatory `provider` query parameter.

| Endpoint | Description |
| :--- | :--- |
| `GET /api/categories?provider={p}` | List wallpaper categories. |
| `GET /api/wallpapers?provider={p}` | List recent/popular wallpapers. |
| `GET /api/search?provider={p}&q={query}` | Search wallpapers (`page={n}` for pagination). |
| `GET /api/category/{slug}?provider={p}` | List wallpapers by category slug. |
| `GET /api/wallpaper/{cat}/{slug}?provider={p}` | Detailed wallpaper info. |

### Mandatory `provider` Parameter
The `provider` parameter determines which scraper service is used.

**Valid Values:**
*   `4kwallpapers` (Scrapes: [4kwallpapers.com](https://4kwallpapers.com)) — supports all endpoints including search.
*   `wallpaperaccess` (Scrapes: [wallpaperaccess.com](https://wallpaperaccess.com)) — search is not supported.

**Example Requests:**
```
GET /api/categories?provider=4kwallpapers
GET /api/search?provider=4kwallpapers&q=naruto
GET /api/search?provider=4kwallpapers&q=naruto&page=2
```

## Deployment

This API is configured for Vercel deployment using the provided `vercel.json` configuration file, which handles the Express server as a serverless function.
