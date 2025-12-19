#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { yandexSearchApi } from "./yandex_search_api.js";
import { fetchWebContent, htmlToPlainText } from "./fetch_content.js";
import { z } from "zod";
import { parseSearchResponse } from "./parser.js";

const server = new McpServer({
  name: "yandex-search-mcp",
  version: "1.0.0",
  description: "Server for querying Yandex search results",
  transports: ["stdio"],
});

server.tool(
  "search_web",
  "Performs web searches through Yandex and returns structured results including title, URL, snippet and savedCopyUrl",
  {
    query: z.string().describe("Search query"),
    page_size: z.number().describe("Number of results per page"),
    page_number: z.number().describe("Zero-based page number"),
  },
  async ({ query, page_size, page_number }) => {
    try {
      const xmlOutput = await yandexSearchApi({
        query,
        page_size,
        page_number,
      });
      const results = await parseSearchResponse(xmlOutput);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                results,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Search failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "fetch_content",
  "Fetches web page content from a given URL (e.g., savedCopyUrl from search results)",
  {
    url: z.string().describe("URL of the web page to fetch"),
  },
  async ({ url }) => {
    try {
      const content = await fetchWebContent(url);
      const plainText = htmlToPlainText(content);
      return {
        content: [
          {
            type: "text",
            text: plainText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch content: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Yandex Search MCP server running on stdio");
