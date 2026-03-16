const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);

  eleventyConfig.addPassthroughCopy("content/blog/**/*.jpg");
  eleventyConfig.addPassthroughCopy("content/blog/**/*.png");
  eleventyConfig.addPassthroughCopy("content/blog/**/*.gif");
  eleventyConfig.addPassthroughCopy("content/assets");
  eleventyConfig.addPassthroughCopy("src/styles/global.css");
  eleventyConfig.addPassthroughCopy({ "static": "/" });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const d = typeof dateObj === "string" ? DateTime.fromISO(dateObj) : DateTime.fromJSDate(dateObj);
    return d.toFormat("LLLL dd, yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    const d = typeof dateObj === "string" ? DateTime.fromISO(dateObj) : DateTime.fromJSDate(dateObj);
    return d.toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if(!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if( n < 0 ) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi.getFilteredByGlob("content/blog/**/*.md").sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addFilter("excerpt", (content) => {
    if (!content) return "";
    const excerpt = content.split("\n").slice(0, 5).join(" ").replace(/<[^>]*>?/gm, '');
    return excerpt.length > 200 ? excerpt.slice(0, 200) + "..." : excerpt;
  });

  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    linkify: true
  }).use(markdownItAnchor));

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "public"
    },
    pathPrefix: "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
