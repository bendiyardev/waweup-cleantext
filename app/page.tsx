"use client";

import { useMemo, useRef, useState } from "react";
import {
  analyze,
  clean,
  CleanOptions,
  CleanResult,
  DEFAULT_OPTIONS,
  OPTION_DEFS,
} from "@/lib/clean";

function Switch({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="switch"
      onClick={onToggle}
    >
      <span className="thumb" />
    </button>
  );
}

export default function Page() {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<CleanResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const issues = useMemo(() => analyze(text), [text]);
  const issueTotal = issues.reduce((sum, issue) => sum + issue.count, 0);

  const toggleOption = (key: keyof CleanOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClean = () => {
    setResult(clean(text, options));
    setCopied(false);
    setShowRemoved(false);
  };

  const handleReset = () => {
    setResult(null);
    setText("");
    setCopied(false);
    setShowRemoved(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — nothing else to do client-side.
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.output], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cleaned.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          <a className="wordmark" href="/">
            waweup.
          </a>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>CleanText</h1>
          <p>Remove invisible and unwanted characters.</p>
        </section>

        <div className="card">
          {result === null ? (
            <>
              <textarea
                className="text-input"
                placeholder="Paste text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                aria-label="Text to clean"
              />

              <div className="status" role="status">
                {text.length === 0 ? null : issueTotal > 0 ? (
                  <span>
                    {issueTotal} issue{issueTotal === 1 ? "" : "s"} found
                  </span>
                ) : (
                  <>
                    <span className="check">✓</span>
                    <span>Text looks clean</span>
                  </>
                )}
              </div>

              {issues.length > 0 && (
                <div className="section">
                  <p className="section-label">Detected</p>
                  {issues.map((issue) => (
                    <div className="issue-row" key={issue.key}>
                      <span className="issue-label">{issue.label}</span>
                      <span className="issue-count">{issue.count}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="section">
                <p className="section-label">Options</p>
                {OPTION_DEFS.map((def) => (
                  <div className="option-row" key={def.key}>
                    <span
                      className="option-label"
                      onClick={() => toggleOption(def.key)}
                    >
                      {def.label}
                    </span>
                    <Switch
                      checked={options[def.key]}
                      onToggle={() => toggleOption(def.key)}
                      label={def.label}
                    />
                  </div>
                ))}
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={handleClean}
                  disabled={text.length === 0}
                >
                  Clean Text
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="result-status">
                <span className="check">✓</span>
                <span>Text cleaned</span>
              </div>

              <textarea
                className="text-input"
                value={result.output}
                readOnly
                spellCheck={false}
                aria-label="Cleaned text"
              />

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy Clean Text"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleDownload}
                >
                  Download .txt
                </button>
              </div>

              <p className="result-info">
                {result.total === 0
                  ? "No changes were needed."
                  : `${result.total} unwanted character${
                      result.total === 1 ? "" : "s"
                    } removed`}
              </p>

              {result.removed.length > 0 && (
                <div className="section">
                  <button
                    type="button"
                    className="disclosure-btn"
                    aria-expanded={showRemoved}
                    onClick={() => setShowRemoved((v) => !v)}
                  >
                    <span className="chevron">▶</span>
                    Show removed characters
                  </button>

                  {showRemoved && (
                    <div className="removed-list">
                      {result.removed.map((r) => (
                        <div className="removed-row" key={r.key}>
                          <span className="removed-code">{r.code}</span>
                          <span className="removed-name">{r.name}</span>
                          <span className="removed-count">× {r.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="section">
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={handleReset}
                >
                  Clean Another Text
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="privacy">Processed locally in your browser.</p>
          <p className="byline">by WaweUp</p>
        </div>
      </footer>
    </>
  );
}
