# 4K Wallpaper API

A professional, multi-provider wallpaper scraping API built with Express.js.

*   **Production:** `https://wallpapers-api-three.vercel.app`
*   **Local:** `http://localhost:3002`
*   **Content type:** `application/json`
*   **CORS:** open to all origins

---

## Quick start

```bash
npm install
npm start          # http://localhost:3002
```

Every request **must** carry the `provider` query parameter:

| `provider` | Source | Endpoints |
| :--- | :--- | :--- |
| `4kwallpapers` | [4kwallpapers.com](https://4kwallpapers.com) | all endpoints |
| `wallpaperaccess` | [wallpaperaccess.com](https://wallpaperaccess.com) | everything **except** search |

```http
GET /api/categories?provider=4kwallpapers
```

---

## Endpoints

### 1. Health check

```http
GET /
```

```json
{ "message": "4k-wallpapers API is running" }
```

---

### 2. List categories

```http
GET /api/categories?provider={p}
```

Returns every wallpaper category offered by the provider.

**Example:** `GET /api/categories?provider=4kwallpapers` → 30 categories

```json
[
  { "name": "Abstract", "url": "/abstract/", "slug": "abstract" },
  { "name": "Anime",    "url": "/anime/",    "slug": "anime" }
]
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | string | Display name |
| `url` | string | Path on the source site |
| `slug` | string | Use it in `/api/category/{slug}` |

---

### 3. List wallpapers (home / recent)

```http
GET /api/wallpapers?provider={p}&page={n}
```

| Param | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `provider` | yes | – | `4kwallpapers` \| `wallpaperaccess` |
| `page` | no | `1` | Page number |
| `slug` | no | – | Optional listing path, e.g. `slug=nature&page=2` → `/nature/?page=2` |

*   Page 1 returns 34 wallpapers, pages 2+ return 24 each.
*   `X-Total-Pages: 968`

**Example:** `GET /api/wallpapers?provider=4kwallpapers&page=3`

```json
[
  {
    "title": "Guy Fawkes Mask Wallpaper",
    "link": "/sci-fi/guy-fawkes-mask-27359.html",
    "thumb": "https://4kwallpapers.com/images/walls/thumbs/27359.jpg",
    "id": "27359"
  }
]
```

> Promotional/collection cards that are mixed into the home page markup are
> filtered out — every entry is a real wallpaper.

---

### 4. List wallpapers by category

```http
GET /api/category/{slug}?provider={p}&page={n}
```

**Example:** `GET /api/category/anime?provider=4kwallpapers&page=4`

*   24 wallpapers per page, `X-Total-Pages: 78` for `/anime`.
*   Response shape is identical to `/api/wallpapers`.

---

### 5. Search

Both styles are supported and return identical results:

```http
GET /api/search/{query}?provider={p}&page={n}      ← path style
GET /api/search?provider={p}&q={query}&page={n}    ← query style
```

**Examples:**
```http
GET /api/search/naruto?provider=4kwallpapers&page=2
GET /api/search?provider=4kwallpapers&q=naruto&page=2
GET /api/search/anime%20girl?provider=4kwallpapers     (spaces OK — converted to "anime-girl")
```

*   24 results per page (last page may be partial).
*   Multi-word queries are hyphenated the way the source site expects.
*   `wallpaperaccess` does not support search → `400`.

---

### 6. Wallpaper details

```http
GET /api/wallpaper/{category}/{slug}?provider={p}
```

The `.html` suffix on `{slug}` is optional — it is appended automatically.

**Example:** `GET /api/wallpaper/nature/desert-rocks-27362?provider=4kwallpapers`

```json
{
  "title": "Desert Rocks Wallpaper",
  "description": "A dry desert landscape with rocks ...",
  "downloadLinks": [
    { "resolution": "1920x1080", "url": "https://4kwallpapers.com/images/wallpapers/desert-rocks-1920x1080-27362.jpg" },
    { "resolution": "2560x1440", "url": "https://4kwallpapers.com/images/wallpapers/desert-rocks-2560x1440-27362.jpg" }
  ],
  "tags": ["desert", "rocks", "nature", "4K wallpaper"]
}
```

`downloadLinks` contains every available resolution (typically 24–42 entries).

---

## Pagination

All listing endpoints accept `page` (default `1`). URLs are built exactly the
way the source site builds them:

| Listing | Page 1 | Page n |
| :--- | :--- | :--- |
| Home (`/api/wallpapers`) | `/` | `/?page=3` |
| Category (`/api/category/{slug}`) | `/{slug}/` | `/{slug}/?page=4` |
| Search (`/api/search/{query}`) | `/search/?q={q}` | `/search/{q}?page=2` |

*   Listing responses include an **`X-Total-Pages`** header scraped from the
    site's pagination bar (e.g. `968` home, `78` anime, `8` for "naruto").
*   Requesting a page **past the end** returns `200` with an **empty array**
    (the source site answers `404` for those URLs), so infinite scroll and
    "next" buttons simply stop on an empty result.
*   `X-Total-Pages: 0` accompanies an empty page.

---

## Errors

Errors always use the shape `{ "error": "<message>" }`.

| Status | Cause | Example message |
| :--- | :--- | :--- |
| `400` | Missing `provider` | `Provider is mandatory. Use ?provider=4kwallpapers or ?provider=wallpaperaccess` |
| `400` | Unknown `provider` | `Invalid provider` |
| `400` | Missing search query | `Search query is mandatory. Use /api/search/{query} or ?q={query}` |
| `400` | Provider lacks endpoint | `Search is not supported by this provider` |
| `404` | Wallpaper does not exist | `Wallpaper not found: /nature/xyz.html` |
| `429` | Rate limit exceeded | `Too many requests, please try again later.` |

---

## Rate limiting

*   **100 requests per 15 minutes** per IP.
*   Standard `RateLimit-*` headers are returned on every response
    (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`).

---

## Project structure

```
4kwallpapers-api/
├── index.js                 # Express app, routes, provider dispatch
├── providers/
│   ├── 4kwallpapers.js      # axios + cheerio scraper (incl. search & pagination)
│   └── wallpaperaccess.js   # puppeteer scraper (lazy-loaded)
├── vercel.json              # Serverless deployment config
├── package.json
└── README.md
```

---

## Deployment

### Vercel
Connect the `4kwallpapers-api` folder as its own Vercel project — the bundled
`vercel.json` wraps the Express app as a serverless function.

> **Note:** the `wallpaperaccess` provider uses Puppeteer, which needs a full
> browser binary. It is `require`d lazily (only when that provider is used), so
> the `4kwallpapers` provider works on Vercel out of the box.

### Local development
```bash
npm start                      # http://localhost:3002
PORT=4000 npm start            # custom port
```

### Git
```bash
git add .
git commit -m "description"
git push
```
