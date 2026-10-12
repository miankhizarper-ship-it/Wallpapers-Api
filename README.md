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
GET /api/wallpapers?provider=4kwallpapers&page=3
GET /api/category/anime?provider=4kwallpapers&page=4
GET /api/search?provider=4kwallpapers&q=naruto
GET /api/search?provider=4kwallpapers&q=naruto&page=2
```

### Pagination

All listing endpoints accept a `page` parameter (`1` by default). URLs are built
exactly the way the source site builds them:

| Listing | Page 1 | Page n |
| :--- | :--- | :--- |
| Home (`/api/wallpapers`) | `/` | `/?page=3` |
| Category (`/api/category/{slug}`) | `/{slug}/` | `/{slug}/?page=4` |
| Search (`/api/search`) | `/search/?q={q}` | `/search/{q}?page=2` |

*   Every response carries an **`X-Total-Pages`** header scraped from the site's
    pagination bar (e.g. `968` for the home listing, `78` for `/anime`).
*   Requesting a page past the end of a listing returns **`200` with an empty
    array** (the source site answers `404` for those URLs), so infinite scroll
    and "next" buttons can simply stop on an empty result.
*   Promotional/collection cards that are mixed into the home page markup are
    filtered out — every returned entry is a real wallpaper (`{slug}-{id}.html`).

## Deployment

This API is configured for Vercel deployment using the provided `vercel.json` configuration file, which handles the Express server as a serverless function.
