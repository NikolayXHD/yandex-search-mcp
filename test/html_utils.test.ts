import { convertXmlTagToText, parseOptions } from "../src/parser.ts";
import { parseString } from "xml2js";
import { expect } from "chai";

describe("Passage Utils", () => {
  it("should handle plain text passages", (done) => {
    const xml = "<passage>Plain text</passage>";
    parseString(xml, parseOptions, (err, result) => {
      expect(convertXmlTagToText(result)).to.equal("Plain text");
      done();
    });
  });

  describe("Tag preservation", () => {
    it("should handle text after tag", (done) => {
      const xml = "<passage><b>Bold</b> suffix</passage>";
      parseString(xml, parseOptions, (err, result) => {
        expect(convertXmlTagToText(result)).to.equal("<b>Bold</b> suffix");
        done();
      });
    });

    it("should handle text before tag", (done) => {
      const xml = "<passage>Prefix <b>Bold</b></passage>";
      parseString(xml, parseOptions, (err, result) => {
        expect(convertXmlTagToText(result)).to.equal("Prefix <b>Bold</b>");
        done();
      });
    });

    it("should handle text before and after tag", (done) => {
      const xml = "<passage>Prefix <b>Bold</b> suffix</passage>";
      parseString(xml, parseOptions, (err, result) => {
        expect(convertXmlTagToText(result)).to.equal(
          "Prefix <b>Bold</b> suffix"
        );
        done();
      });
    });

    it("should handle nested tags", (done) => {
      const xml = "<passage><b>Bold <i>Italic</i></b></passage>";
      parseString(xml, parseOptions, (err, result) => {
        expect(convertXmlTagToText(result)).to.equal(
          "<b>Bold <i>Italic</i></b>"
        );
        done();
      });
    });

    it("should handle multiple sibling tags", (done) => {
      const xml = "<passage>Prefix<b>Bold</b><i>Italic</i>Suffix</passage>";
      parseString(xml, parseOptions, (err, result) => {
        expect(convertXmlTagToText(result)).to.equal(
          "Prefix<b>Bold</b><i>Italic</i>Suffix"
        );
        done();
      });
    });
  });
});
