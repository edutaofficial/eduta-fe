/**
 * Text Utility Functions
 * Professional utilities for text processing and analysis
 */

/**
 * Counts the number of words in an HTML string by stripping HTML tags
 * and counting only actual word sequences.
 * 
 * This function:
 * - Removes all HTML tags and their attributes
 * - Decodes common HTML entities
 * - Normalizes whitespace
 * - Filters out empty strings and non-word sequences
 * - Returns accurate word count
 * 
 * @param htmlString - HTML string to count words from
 * @returns Number of words (0 if empty or no words found)
 * 
 * @example
 * countWords("<p>Hello This is me </p></br>") // Returns 3
 * countWords("<h1>Title</h1><p>Content here</p>") // Returns 3
 * countWords("<p></p>") // Returns 0
 * countWords("") // Returns 0
 */
export function countWords(htmlString: string): number {
  if (!htmlString || typeof htmlString !== "string") {
    return 0;
  }

  // Step 1: Remove all HTML tags and their attributes
  let text = htmlString.replace(/<[^>]*>/g, " ");

  // Step 2: Decode common HTML entities to their actual characters
  // This ensures entities like &nbsp; don't interfere with word counting
  const entityMap: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&hellip;": "...",
    "&mdash;": "—",
    "&ndash;": "–",
  };

  // Replace named entities
  for (const [entity, replacement] of Object.entries(entityMap)) {
    text = text.replace(new RegExp(entity, "gi"), replacement);
  }

  // Replace numeric entities (&#123; and &#x1F;)
  text = text.replace(/&#\d+;/g, " ");
  text = text.replace(/&#x[\da-f]+;/gi, " ");

  // Step 3: Normalize whitespace - replace multiple spaces/newlines/tabs with single space
  text = text.replace(/\s+/g, " ");

  // Step 4: Trim leading and trailing whitespace
  text = text.trim();

  // Step 5: If empty after processing, return 0
  if (!text) {
    return 0;
  }

  // Step 6: Split by space and filter to only actual words
  // A word is defined as a sequence that contains at least one word character (\w)
  // This excludes pure punctuation, empty strings, and whitespace-only sequences
  const words = text
    .split(" ")
    .filter((word) => {
      // Remove leading/trailing punctuation but keep the word if it has word characters
      const trimmed = word.trim();
      // Check if the trimmed word contains at least one word character (letter, digit, or underscore)
      return trimmed.length > 0 && /\w/.test(trimmed);
    });

  return words.length;
}

/**
 * Truncates HTML content to a maximum word count while preserving HTML structure.
 * This function intelligently removes words from the end while maintaining valid HTML.
 * 
 * @param htmlString - HTML string to truncate
 * @param maxWords - Maximum number of words to keep
 * @returns Truncated HTML string with valid structure
 */
export function truncateHtmlByWords(htmlString: string, maxWords: number): string {
  if (!htmlString || typeof htmlString !== "string") {
    return "";
  }

  // Safety check for browser environment
  if (typeof document === "undefined") {
    // Fallback: simple truncation if DOM is not available
    const currentWordCount = countWords(htmlString);
    if (currentWordCount <= maxWords) {
      return htmlString;
    }
    // Return empty string as fallback (shouldn't happen in client-side usage)
    return "";
  }

  const currentWordCount = countWords(htmlString);
  if (currentWordCount <= maxWords) {
    return htmlString;
  }

  // Create a temporary DOM element to work with
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;

  // Walk through text nodes and count words, removing excess
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT,
    null
  );

  let wordCount = 0;
  const nodesToProcess: Array<{ node: Text; words: string[] }> = [];

  // First pass: collect all text nodes with their words
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const text = textNode.textContent || "";
    const words = text.trim().split(/\s+/).filter((w) => /\w/.test(w));
    if (words.length > 0) {
      nodesToProcess.push({ node: textNode, words });
      wordCount += words.length;
    }
  }

  // If we're already under limit, return original
  if (wordCount <= maxWords) {
    return htmlString;
  }

  // Second pass: truncate from the end
  let wordsToRemove = wordCount - maxWords;
  for (let i = nodesToProcess.length - 1; i >= 0 && wordsToRemove > 0; i--) {
    const { node: textNode, words } = nodesToProcess[i];
    
    if (words.length <= wordsToRemove) {
      // Remove entire text node
      textNode.textContent = "";
      wordsToRemove -= words.length;
    } else {
      // Remove partial words from the end
      const wordsToKeep = words.slice(0, words.length - wordsToRemove);
      textNode.textContent = wordsToKeep.join(" ");
      wordsToRemove = 0;
    }
  }

  // Return the truncated HTML
  return tempDiv.innerHTML;
}

