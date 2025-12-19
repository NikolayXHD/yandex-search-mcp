# Yandex Search MCP Server

MCP server for Yandex Search API with web content fetching capabilities.

## Features

1. **Search Web** - Perform web searches through Yandex and get structured results
2. **Fetch Web Content** - Download HTML content from URLs (including savedCopyUrl from search results)

## Setup

### Prerequisites
- Node.js 18+
- Yandex Cloud account with Search API enabled
- API key and folder ID from Yandex Cloud

### Installation
```bash
npm install
npm run build
```

### Configuration
Add to your MCP client configuration (e.g., Claude Desktop):

```json
"mcpServers": {
    "yandex-search-mcp": {
         "command": "node",
         "args": [
              "<REPO_ROOT>/yandex-search-mcp/build/index.js"
          ],
         "env": {
             "YANDEX_API_KEY": "your_api_key_here",
             "YANDEX_FOLDER_ID": "your_folder_id_here"
         }
    }
}
```

## Available Tools

### 1. search_web
Performs web searches through Yandex and returns structured results including title, URL, snippet and savedCopyUrl.

**Parameters:**
- `query` (string): Search query
- `page_size` (number): Number of results per page
- `page_number` (number): Zero-based page number

**Example response:**
```json
{
  "results": [
    {
      "url": "https://example.com",
      "title": "Example Page",
      "snippet": "Example content...",
      "savedCopyUrl": "https://yandexwebcache.net/..."
    }
  ]
}
```

### 2. fetch_web_content
Fetches web page content from a given URL (e.g., savedCopyUrl from search results). Uses built-in fetch API with timeout support.

**Parameters:**
- `url` (string): URL of the web page to fetch

**Returns:** Raw HTML content as text

**Features:**
- 10 second timeout by default (configurable)
- User-Agent header for compatibility
- Error handling for HTTP errors and network issues

## Development

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Running in development mode
```bash
npm run dev
```

## Links
- [Yandex Search API Quickstart](https://yandex.cloud/ru/docs/search-api/quickstart/)
- [Yandex Cloud API Keys](https://yandex.cloud/ru/docs/iam/operations/authentication/manage-api-keys#create-api-key)
- [Yandex Cloud Folder ID](https://yandex.cloud/ru/docs/resource-manager/operations/folder/get-id)
