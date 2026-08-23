/**
 * CleanText — client-side detection and cleaning of invisible and
 * unwanted characters. No text ever leaves the browser.
 */

export interface CleanOptions {
  zeroWidth: boolean;
  spaces: boolean;
  hidden: boolean;
  lineBreaks: boolean;
  trim: boolean;
}

export const DEFAULT_OPTIONS: CleanOptions = {
  zeroWidth: true,
  spaces: true,
  hidden: true,
  lineBreaks: false,
  trim: false,
};

export const OPTION_DEFS: { key: keyof CleanOptions; label: string }[] = [
  { key: "zeroWidth", label: "Remove zero-width characters" },
  { key: "spaces", label: "Normalize spaces" },
  { key: "hidden", label: "Remove hidden Unicode" },
  { key: "lineBreaks", label: "Normalize line breaks" },
  { key: "trim", label: "Trim line endings" },
];

// ZWSP, ZWNJ, ZWJ, Word Joiner, BOM/ZWNBSP
const ZERO_WIDTH_RE = new RegExp("[\\u200B-\\u200D\\u2060\\uFEFF]", "g");

// NBSP, Figure Space, Narrow No-Break Space
const NBSP_RE = new RegExp("[\\u00A0\\u2007\\u202F]", "g");

// Ogham Space Mark, En Quad..Six-Per-Em, Punctuation..Hair Space,
// Medium Mathematical Space, Ideographic Space
const UNUSUAL_SPACE_RE = new RegExp(
  "[\\u1680\\u2000-\\u2006\\u2008-\\u200A\\u205F\\u3000]",
  "g"
);

// C0 controls (except Tab/LF/CR), DEL + C1 controls, Soft Hyphen,
// Combining Grapheme Joiner, Arabic Letter Mark, Mongolian Vowel Separator,
// bidi marks/embeddings/overrides/isolates, interlinear annotation chars
const HIDDEN_RE = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F" +
    "\\u00AD\\u034F\\u061C\\u180E\\u200E\\u200F\\u202A-\\u202E" +
    "\\u2066-\\u2069\\uFFF9-\\uFFFB]",
  "g"
);

// CRLF, lone CR, Line Separator, Paragraph Separator
const LINE_BREAK_RE = new RegExp("\\r\\n?|[\\u2028\\u2029]", "g");

const TRAILING_RE = new RegExp("[ \\t]+(?=[\\r\\n]|$)", "g");

const CHAR_NAMES: Record<number, string> = {
  0x0009: "Tab",
  0x000d: "Carriage Return",
  0x00a0: "Non-breaking Space",
  0x00ad: "Soft Hyphen",
  0x034f: "Combining Grapheme Joiner",
  0x061c: "Arabic Letter Mark",
  0x1680: "Ogham Space Mark",
  0x180e: "Mongolian Vowel Separator",
  0x2000: "En Quad",
  0x2001: "Em Quad",
  0x2002: "En Space",
  0x2003: "Em Space",
  0x2004: "Three-Per-Em Space",
  0x2005: "Four-Per-Em Space",
  0x2006: "Six-Per-Em Space",
  0x2007: "Figure Space",
  0x2008: "Punctuation Space",
  0x2009: "Thin Space",
  0x200a: "Hair Space",
  0x200b: "Zero Width Space",
  0x200c: "Zero Width Non-Joiner",
  0x200d: "Zero Width Joiner",
  0x200e: "Left-to-Right Mark",
  0x200f: "Right-to-Left Mark",
  0x2028: "Line Separator",
  0x2029: "Paragraph Separator",
  0x202a: "Left-to-Right Embedding",
  0x202b: "Right-to-Left Embedding",
  0x202c: "Pop Directional Formatting",
  0x202d: "Left-to-Right Override",
  0x202e: "Right-to-Left Override",
  0x202f: "Narrow No-Break Space",
  0x205f: "Medium Mathematical Space",
  0x2060: "Word Joiner",
  0x2066: "Left-to-Right Isolate",
  0x2067: "Right-to-Left Isolate",
  0x2068: "First Strong Isolate",
  0x2069: "Pop Directional Isolate",
  0x3000: "Ideographic Space",
  0xfeff: "Zero Width No-Break Space (BOM)",
  0xfff9: "Interlinear Annotation Anchor",
  0xfffa: "Interlinear Annotation Separator",
  0xfffb: "Interlinear Annotation Terminator",
};

export function formatCode(cp: number): string {
  return "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
}

export function charName(cp: number): string {
  const name = CHAR_NAMES[cp];
  if (name) return name;
  if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f)) return "Control Character";
  return "Invisible Character";
}

export interface Issue {
  key: string;
  label: string;
  count: number;
}

export function analyze(text: string): Issue[] {
  if (!text) return [];

  const count = (re: RegExp) => (text.match(re) ?? []).length;

  let extraSpaces = 0;
  text.replace(/ {2,}/g, (m, offset: number) => {
    // Line-start runs are indentation, line-end runs are trailing
    // whitespace — only mid-line runs count as extra spaces.
    const before = offset === 0 ? "\n" : text[offset - 1];
    const after = text[offset + m.length];
    if (
      before !== "\n" &&
      before !== "\r" &&
      after !== undefined &&
      after !== "\n" &&
      after !== "\r"
    ) {
      extraSpaces += m.length - 1;
    }
    return m;
  });

  const trailing = (text.match(TRAILING_RE) ?? []).reduce(
    (sum, m) => sum + m.length,
    0
  );

  const found: Issue[] = [
    { key: "zeroWidth", label: "Zero-width characters", count: count(ZERO_WIDTH_RE) },
    { key: "nbsp", label: "Non-breaking spaces", count: count(NBSP_RE) },
    { key: "unusualSpaces", label: "Unusual spaces", count: count(UNUSUAL_SPACE_RE) },
    { key: "extraSpaces", label: "Extra spaces", count: extraSpaces },
    { key: "hidden", label: "Hidden Unicode", count: count(HIDDEN_RE) },
    { key: "lineBreaks", label: "Line break issues", count: count(LINE_BREAK_RE) },
    { key: "trailing", label: "Trailing whitespace", count: trailing },
  ];

  return found.filter((issue) => issue.count > 0);
}

export interface Removal {
  key: string;
  code: string;
  name: string;
  count: number;
}

export interface CleanResult {
  output: string;
  removed: Removal[];
  total: number;
}

export function clean(text: string, opts: CleanOptions): CleanResult {
  const tally = new Map<string, Removal>();

  const bump = (key: string, code: string, name: string, n = 1) => {
    const current = tally.get(key);
    if (current) current.count += n;
    else tally.set(key, { key, code, name, count: n });
  };

  const bumpChar = (char: string) => {
    const cp = char.codePointAt(0) ?? 0;
    bump(formatCode(cp), formatCode(cp), charName(cp));
  };

  let out = text;

  if (opts.zeroWidth) {
    out = out.replace(ZERO_WIDTH_RE, (m) => {
      bumpChar(m);
      return "";
    });
  }

  if (opts.hidden) {
    out = out.replace(HIDDEN_RE, (m) => {
      bumpChar(m);
      return "";
    });
  }

  if (opts.lineBreaks) {
    out = out.replace(LINE_BREAK_RE, (m) => {
      if (m === "\r\n" || m === "\r") bump("U+000D", "U+000D", "Carriage Return");
      else bumpChar(m);
      return "\n";
    });
  }

  if (opts.spaces) {
    out = out.replace(NBSP_RE, (m) => {
      bumpChar(m);
      return " ";
    });
    out = out.replace(UNUSUAL_SPACE_RE, (m) => {
      bumpChar(m);
      return " ";
    });
    out = out.replace(/ {2,}/g, (m, offset: number, str: string) => {
      const before = offset === 0 ? "\n" : str[offset - 1];
      const after = str[offset + m.length];
      if (before === "\n" || before === "\r") return m; // indentation
      if (after === undefined || after === "\n" || after === "\r") return m; // trailing
      bump("extra-space", "U+0020", "Space (extra)", m.length - 1);
      return " ";
    });
  }

  if (opts.trim) {
    out = out.replace(TRAILING_RE, (m) => {
      const spaces = m.split(" ").length - 1;
      const tabs = m.length - spaces;
      if (spaces) bump("trailing-space", "U+0020", "Space (trailing)", spaces);
      if (tabs) bump("trailing-tab", "U+0009", "Tab (trailing)", tabs);
      return "";
    });
  }

  const removed = Array.from(tally.values()).sort((a, b) => b.count - a.count);
  const total = removed.reduce((sum, r) => sum + r.count, 0);

  return { output: out, removed, total };
}
