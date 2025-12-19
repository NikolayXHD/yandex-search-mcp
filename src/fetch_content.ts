import TurndownService from "turndown";

/**
 * Нормализует URL: для домена yandexwebcache.net добавляет параметр mode=text
 * @param url Исходный URL
 * @returns Нормализованный URL
 */
export function normalizeUrl(url: string): string {
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch {
    return url;
  }

  if (urlObj.hostname !== "yandexwebcache.net") {
    return url;
  }

  if (urlObj.searchParams.has("mode")) {
    return url;
  }

  const separator = urlObj.search ? "&" : "?";
  return url + separator + "mode=text";
}

/**
 * Функция для получения содержимого веб-страницы по URL
 * @param url URL страницы для загрузки
 * @returns Promise с содержимым страницы в виде строки
 */
export async function fetchWebContent(url: string): Promise<string> {
  try {
    const normalizedUrl = normalizeUrl(url);
    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; YandexSearchMCP/1.0; +http://github.com)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      // timeout: timeout,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain")
    ) {
      console.warn(`Unexpected content type: ${contentType}`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch content from ${url}: ${error.message}`);
    }
    throw new Error(`Failed to fetch content from ${url}: ${String(error)}`);
  }
}

/**
 * Конвертирует HTML в plain text с использованием Turndown
 * @param html HTML строка для конвертации
 * @returns Конвертированный plain text
 */
export function htmlToPlainText(html: string): string {
  try {
    const turndownService = createTurndownService();
    const markdown = turndownService.turndown(html);
    return markdown;
  } catch (error) {
    return html;
  }
}

/**
 * Создает экземпляр TurndownService с базовыми настройками
 */
function createTurndownService(): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    bulletListMarker: "-",
  });

  return turndownService;
}
