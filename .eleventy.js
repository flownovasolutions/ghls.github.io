export default function (eleventyConfig) {

  // Pass static assets through to _site unchanged
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");


  // ── Watch targets ───────────────────────────────────────────────
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  return {
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine:     "njk",

    dir: {
      input:    "src",
      output:   "_site",
      includes: "_includes",
      layouts:  "_includes",
      data:     "_data"
    }
  };
}
