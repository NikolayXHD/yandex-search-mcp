#!/usr/bin/env node
import { yandexSearchApi } from '../src/yandex_search_api.js';

(async () => {
  try {
    const testQuery = "test search";
    const result = await yandexSearchApi({
      query: testQuery,
      page_size: 5,
      page_number: 0
    });
    console.log("Yandex Search API Output:");
    console.log(result);
  } catch (error) {
    console.error("Error testing Yandex Search API:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();
