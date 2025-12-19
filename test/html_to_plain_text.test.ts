import { expect } from "chai";
import { htmlToPlainText } from "../src/fetch_content.ts";

describe("htmlToPlainText", () => {
  it("should convert simple HTML to plain text", () => {
    const html = "<p>Hello world</p>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("Hello world");
  });

  it("should handle headings", () => {
    const html = "<h1>Title</h1><p>Content</p>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("# Title\n\nContent");
  });

  it("should convert links to markdown format", () => {
    const html = '<a href="https://example.com">Example</a>';
    const result = htmlToPlainText(html);
    expect(result).to.equal("[Example](https://example.com)");
  });

  it("should handle bold and italic text", () => {
    const html = "<p><b>Bold</b> and <i>italic</i> text</p>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("**Bold** and *italic* text");
  });

  it("should preserve line breaks from br tags", () => {
    const html = "Line 1<br>Line 2<br/>Line 3";
    const result = htmlToPlainText(html);
    expect(result).to.equal("Line 1  \nLine 2  \nLine 3");
  });

  it("should reduce multiple newlines to maximum of two", () => {
    const html = "<p>Para 1</p>\n\n\n\n<p>Para 2</p>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("Para 1\n\nPara 2");
  });

  it("should handle empty HTML", () => {
    const html = "";
    const result = htmlToPlainText(html);
    expect(result).to.equal("");
  });

  it("should handle HTML with only whitespace", () => {
    const html = "   \n\t  ";
    const result = htmlToPlainText(html);
    expect(result).to.equal("");
  });

  it("should convert lists to markdown", () => {
    const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("-   Item 1\n-   Item 2");
  });

  it("should handle nested HTML", () => {
    const html = "<div><p>Outer <span>inner</span> text</p></div>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("Outer inner text");
  });

  it("should trim whitespace", () => {
    const html = "   <p>  Text with spaces  </p>   ";
    const result = htmlToPlainText(html);
    expect(result).to.equal("Text with spaces");
  });

  it("should handle code blocks", () => {
    const html = "<pre><code>console.log('hello');</code></pre>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("```\nconsole.log('hello');\n```");
  });

  it("should handle inline code", () => {
    const html = "<p>Use <code>npm install</code> command</p>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("Use `npm install` command");
  });

  it("should handle blockquotes", () => {
    const html = "<blockquote>Important quote</blockquote>";
    const result = htmlToPlainText(html);
    expect(result).to.equal("> Important quote");
  });
});
