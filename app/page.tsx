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
import { TopControls, useI18n } from "@/components/site-chrome";
import Faq from "@/components/faq";

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
  const { t, d } = useI18n();
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
    a.download = t("downloadName");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <TopControls />

      <main className="container">
        <section className="hero">
          <h1>CleanText</h1>
          <p>{t("subtitle")}</p>
        </section>

        <div className="card">
          {result === null ? (
            <>
              <textarea
                className="text-input"
                placeholder={t("placeholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                aria-label={t("inputAria")}
              />

              <div className="status" role="status">
                {text.length === 0 ? null : issueTotal > 0 ? (
                  <span>
                    {issueTotal === 1
                      ? t("issuesFoundOne")
                      : t("issuesFoundMany", { n: issueTotal })}
                  </span>
                ) : (
                  <>
                    <span className="check">✓</span>
                    <span>{t("textClean")}</span>
                  </>
                )}
              </div>

              {issues.length > 0 && (
                <div className="section">
                  <p className="section-label">{t("detected")}</p>
                  {issues.map((issue) => (
                    <div className="issue-row" key={issue.key}>
                      <span className="issue-label">
                        {d.issueLabels[issue.key] ?? issue.label}
                      </span>
                      <span className="issue-count">{issue.count}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="section">
                <p className="section-label">{t("options")}</p>
                {OPTION_DEFS.map((def) => (
                  <div className="option-row" key={def.key}>
                    <span
                      className="option-label"
                      onClick={() => toggleOption(def.key)}
                    >
                      {d.optionLabels[def.key] ?? def.label}
                    </span>
                    <Switch
                      checked={options[def.key]}
                      onToggle={() => toggleOption(def.key)}
                      label={d.optionLabels[def.key] ?? def.label}
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
                  {t("cleanBtn")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="result-status">
                <span className="check">✓</span>
                <span>{t("cleaned")}</span>
              </div>

              <textarea
                className="text-input"
                value={result.output}
                readOnly
                spellCheck={false}
                aria-label={t("outputAria")}
              />

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCopy}
                >
                  {copied ? t("copied") : t("copy")}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleDownload}
                >
                  {t("download")}
                </button>
              </div>

              <p className="result-info">
                {result.total === 0
                  ? t("noChanges")
                  : result.total === 1
                    ? t("removedOne")
                    : t("removedMany", { n: result.total })}
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
                    {t("showRemoved")}
                  </button>

                  {showRemoved && (
                    <div className="removed-list">
                      {result.removed.map((r) => (
                        <div className="removed-row" key={r.key}>
                          <span className="removed-code">{r.code}</span>
                          <span className="removed-name">
                            {d.charNames[r.name] ?? r.name}
                          </span>
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
                  {t("cleanAnother")}
                </button>
              </div>
            </>
          )}
        </div>

        <Faq />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="privacy">{t("privacy")}</p>
          <p className="byline">{t("byline")}</p>
        </div>
      </footer>
    </>
  );
}
