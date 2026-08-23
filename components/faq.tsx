"use client";

import { useI18n } from "@/components/site-chrome";

function ChevronDownIcon() {
  return (
    <svg
      className="faq-chevron"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Faq() {
  const { t, d } = useI18n();

  return (
    <section className="faq" aria-label={t("faqTitle")}>
      <h2>{t("faqTitle")}</h2>
      <div className="faq-list">
        {d.faq.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary>
              {item.q}
              <ChevronDownIcon />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
