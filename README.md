# 4KWallpapers API Documentation

## What is it?
The 4KWallpapers API is a Node.js-based web service that scrapes data from [4kwallpapers.com](https://4kwallpapers.com/). It converts the website's HTML content into a structured JSON API, allowing developers to easily fetch wallpaper data (categories, recent wallpapers, and wallpaper details) for use in their own applications or websites.

### Key Features
- **Scraped Data**: Real-time access to wallpapers from 4kwallpapers.com.
- **RESTful**: Simple, standard HTTP GET requests.
- **Secure**: Implements `helmet` for security headers, CORS for cross-domain access, and rate limiting to prevent abuse.
- **Lightweight**: Uses `express`, `axios`, and `cheerio`.

---

## How to use in sites

### 1. Installation & Running
1. Clone the project or copy the directory to your server.
2. Navigate to the directory: `cd 4kwallpapers-api`
3. Install dependencies: `npm install`
4. Start the server: `npm start`
   - The API will run on `http://localhost:3002` by default.

### 2. Available Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/categories` | `GET` | Returns a list of all wallpaper categories. |
| `/api/wallpapers` | `GET` | Returns a list of recent wallpapers. Supports `?page=n`. |
| `/api/category/:slug` | `GET` | Returns wallpapers for a specific category (e.g., `/api/category/anime`). Supports `?page=n`. |
| `/api/wallpaper/:cat/:slug` | `GET` | Returns detailed info (high-res links, tags) for a specific wallpaper. |

### 3. Example Request (JavaScript/Frontend)
You can use the `fetch` API in your frontend to display wallpapers:

```javascript
// Fetch wallpaper details for a specific wallpaper
async function fetchWallpaperDetails(category, slug) {
  try {
    const response = await fetch(`http://localhost:3002/api/wallpaper/${category}/${slug}`);
    const data = await response.json();
    console.log(data);
    // Display data (e.g., data.downloadLinks[0].url)
  } catch (error) {
    console.error('Error fetching wallpaper:', error);
  }
}

// Example usage
fetchWallpaperDetails('anime', 'kimi-no-na-wa-27358');
```

### 4. Implementation Tips
- **Caching**: Since the data is being scraped from a third-party site, implement caching on your backend to avoid rate-limiting from the source website and improve response time.
- **Error Handling**: Always wrap your API calls in `try/catch` blocks.
- **Images**: Ensure your frontend respects the source website's terms of service when displaying images returned by this API.
