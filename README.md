# 4K Wallpaper API

A professional, multi-provider wallpaper scraping API built with Express.js.

## API Documentation

All API requests **must** include the mandatory `provider` query parameter.

| Endpoint | Description |
| :--- | :--- |
| `GET /api/categories?provider={p}` | List wallpaper categories. |
| `GET /api/wallpapers?provider={p}` | List recent/popular wallpapers. |
| `GET /api/category/{slug}?provider={p}` | List wallpapers by category slug. |
| `GET /api/wallpaper/{cat}/{slug}?provider={p}` | Detailed wallpaper info. |

### Mandatory `provider` Parameter
The `provider` parameter determines which scraper service is used.

**Valid Values:**
*   `4kwallpapers` (Scrapes: [4kwallpapers.com](https://4kwallpapers.com))
*   `wallpaperaccess` (Scrapes: [wallpaperaccess.com](https://wallpaperaccess.com))

**Example Request:**
`GET /api/categories?provider=4kwallpapers`

## Deployment

This API is configured for Vercel deployment using the provided `vercel.json` configuration file, which handles the Express server as a serverless function.
