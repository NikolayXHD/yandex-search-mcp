import { expect } from "chai";
import { fetchWebContent, normalizeUrl } from "../src/fetch_content.js";

describe("fetchWebContent", () => {
  it("should fetch HTML content from a valid URL", async () => {
    const content = await fetchWebContent("https://httpbin.org/html");

    expect(content).to.be.a("string");
    expect(content.length).to.be.greaterThan(0);
    expect(content).to.include("<html>");
  }).timeout(5_000);

  it("should handle HTTP errors gracefully", async () => {
    try {
      await fetchWebContent("https://httpbin.org/status/404");
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).to.be.an("Error");
      expect((error as Error).message).to.include("HTTP error");
    }
  }).timeout(5_000);
});

describe("normalizeUrl", () => {
  it("should add mode=text parameter for yandexwebcache.net", () => {
    const url = "https://yandexwebcache.net/some/path";
    const normalized = normalizeUrl(url);
    expect(normalized).to.equal(
      "https://yandexwebcache.net/some/path?mode=text"
    );
  });

  it("should not add duplicate mode parameter", () => {
    const url = "https://yandexwebcache.net/some/path?mode=text";
    const normalized = normalizeUrl(url);
    expect(normalized).to.equal(url);
  });

  it("should preserve existing query parameters and add mode=text", () => {
    const url = "https://yandexwebcache.net/some/path?foo=bar";
    const normalized = normalizeUrl(url);
    expect(normalized).to.equal(
      "https://yandexwebcache.net/some/path?foo=bar&mode=text"
    );
  });

  it("should not modify non-yandexwebcache.net URLs", () => {
    const url = "https://example.com/path";
    const normalized = normalizeUrl(url);
    expect(normalized).to.equal(url);
  });

  it("should handle invalid URL by returning original string", () => {
    const url = "not-a-valid-url";
    const normalized = normalizeUrl(url);
    expect(normalized).to.equal(url);
  });

  it("should handle savedCopyUrl from Yandex Search API", () => {
    const url =
      "https://yandexwebcache.net/yandbtm?fmode=inject&tm=1766158911&tld=com&lang=en&la=1765474560&text=pytest.mark.parametrize+documentation&url=https%3A//docs.pytest.org/en/stable/how-to/parametrize.html&l10n=en&mime=html&sign=f3570a6ff548ac0980284752a248f2a8&keyno=0";
    const normalized = normalizeUrl(url);
    expect(normalized).to.equal(url + "&mode=text");
  });

  it("should not duplicate patched savedCopyUrl from Yandex Search API", () => {
    const url =
      "https://yandexwebcache.net/yandbtm?fmode=inject&tm=1766158911&tld=com&lang=en&la=1765474560&text=pytest.mark.parametrize+documentation&url=https%3A//docs.pytest.org/en/stable/how-to/parametrize.html&l10n=en&mime=html&sign=f3570a6ff548ac0980284752a248f2a8&keyno=0&mode=text";
    const normalized = normalizeUrl(url);
    expect(normalized).to.equal(url);
  });
});
