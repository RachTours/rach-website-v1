// Utility: Unescape HTML entities (Restore original characters)
const unescapeHTMLEntities = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#x5C;/g, "\\");
};

// Utility: Escape special characters to literals (Visual Only)
const escapeSequencesToLiteral = (str) => {
  if (!str || typeof str !== "string") return str;
  const escapeMap = {
    "\n": "\\n",
    "\t": "\\t",
    "\r": "\\r",
    "\f": "\\f",
    "\v": "\\v",
  };
  return str.replace(/[\n\t\r\f\v]/g, (match) => escapeMap[match]);
};

module.exports = { unescapeHTMLEntities, escapeSequencesToLiteral };
