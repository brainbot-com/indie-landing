const fs = require("fs");
const path = require("path");

const sourcePath = path.resolve(__dirname, "..", "index.html");
const lang = "en";
const translationsPath = path.resolve(__dirname, "..", "i18n", `index.html.lang.${lang}.json`);
const outputDir = path.resolve(__dirname, "..", lang);
const outputPath = path.join(outputDir, "index.html");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const htmlSource = fs.readFileSync(sourcePath, "utf8");
const translations = JSON.parse(fs.readFileSync(translationsPath, "utf8"));

let output = htmlSource;
const missing = [];
const used = new Set();

for (const [key, value] of Object.entries(translations)) {
  const keyPattern = escapeRegExp(key);
  const elementPattern = new RegExp(
    `(<([a-zA-Z][\\w:-]*)([^>]*\\sdata-i18n=\"${keyPattern}\"[^>]*)>)([\\s\\S]*?)(</\\2>)`,
    "g"
  );

  let matched = false;
  output = output.replace(elementPattern, (match, openTag, tagName, attrs, inner, closeTag) => {
    matched = true;
    used.add(key);
    const useHtml = attrs.includes('data-i18n-html="true"');
    const replacement = useHtml ? value : escapeHtml(value);
    return `${openTag}${replacement}${closeTag}`;
  });

  if (!matched) {
    missing.push(key);
  }
}

const unused = Object.keys(translations).filter((key) => !used.has(key));

if (missing.length) {
  console.warn(`Missing elements for keys: ${missing.join(", ")}`);
}

if (unused.length) {
  console.warn(`Unused translation keys: ${unused.join(", ")}`);
}

output = output.replace(/<html\b([^>]*?)\blang=\"[^\"]*\"/i, '<html$1lang="' + lang + '"');

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, output, "utf8");

console.log(`Generated ${outputPath}`);
