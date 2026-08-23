"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "tr" | "en";

const en = {
  // Hero
  subtitle: "Remove invisible and unwanted characters.",
  // Input
  placeholder: "Paste text here...",
  inputAria: "Text to clean",
  issuesFoundOne: "1 issue found",
  issuesFoundMany: "{n} issues found",
  textClean: "Text looks clean",
  detected: "Detected",
  options: "Options",
  cleanBtn: "Clean Text",
  // Result
  cleaned: "Text cleaned",
  outputAria: "Cleaned text",
  copy: "Copy Clean Text",
  copied: "Copied!",
  download: "Download .txt",
  downloadName: "cleaned.txt",
  noChanges: "No changes were needed.",
  removedOne: "1 unwanted character removed",
  removedMany: "{n} unwanted characters removed",
  showRemoved: "Show removed characters",
  cleanAnother: "Clean Another Text",
  // Footer
  privacy: "Processed locally in your browser.",
  byline: "by WaweUp",
  // Top controls
  backLabel: "Back to waweup.com",
  themeToDark: "Switch to dark theme",
  themeToLight: "Switch to light theme",
  // FAQ
  faqTitle: "Frequently Asked Questions",
  // Detected issue labels, keyed by Issue.key from lib/clean.ts
  issueLabels: {
    zeroWidth: "Zero-width characters",
    nbsp: "Non-breaking spaces",
    unusualSpaces: "Unusual spaces",
    extraSpaces: "Extra spaces",
    hidden: "Hidden Unicode",
    lineBreaks: "Line break issues",
    trailing: "Trailing whitespace",
  } as Record<string, string>,
  // Cleaning option labels, keyed by CleanOptions keys from lib/clean.ts
  optionLabels: {
    zeroWidth: "Remove zero-width characters",
    spaces: "Normalize spaces",
    hidden: "Remove hidden Unicode",
    lineBreaks: "Normalize line breaks",
    trim: "Trim line endings",
  } as Record<string, string>,
  // Removed-character display names, keyed by the English name from
  // lib/clean.ts. English falls back to the original name.
  charNames: {} as Record<string, string>,
  faq: [
    {
      q: "What hidden characters does CleanText find?",
      a: "CleanText detects zero-width spaces, zero-width joiners and non-joiners, byte order marks (BOM), soft hyphens, bidirectional control marks, non-breaking and unusual Unicode spaces, control characters, and other invisible Unicode characters that often sneak in when you copy text from documents, websites, or AI tools.",
    },
    {
      q: "Is my text uploaded to a server?",
      a: "No. Everything runs entirely in your browser. Your text never leaves your device, nothing is stored, and no data is sent to any server.",
    },
    {
      q: "Why do hidden characters matter?",
      a: "Invisible characters can break code and configuration files, cause formatting glitches, make identical-looking strings fail comparisons, inflate character counts, and even be used for hidden watermarking or tracking.",
    },
    {
      q: "Can I download the cleaned text?",
      a: "Yes. After cleaning, you can copy the result to your clipboard with one click or download it as a plain .txt file.",
    },
    {
      q: "Is CleanText free?",
      a: "Yes. CleanText is a free tool by WaweUp. No sign-up, no limits, no ads — just paste, clean, and go.",
    },
  ],
};

export type Dict = typeof en;

const tr: Dict = {
  // Hero
  subtitle: "Görünmez ve istenmeyen karakterleri temizleyin.",
  // Input
  placeholder: "Metni buraya yapıştırın...",
  inputAria: "Temizlenecek metin",
  issuesFoundOne: "1 sorun bulundu",
  issuesFoundMany: "{n} sorun bulundu",
  textClean: "Metin temiz görünüyor",
  detected: "Tespit Edilenler",
  options: "Seçenekler",
  cleanBtn: "Metni Temizle",
  // Result
  cleaned: "Metin temizlendi",
  outputAria: "Temizlenmiş metin",
  copy: "Temiz Metni Kopyala",
  copied: "Kopyalandı!",
  download: ".txt İndir",
  downloadName: "temizlenmis-metin.txt",
  noChanges: "Herhangi bir değişiklik gerekmedi.",
  removedOne: "1 istenmeyen karakter kaldırıldı",
  removedMany: "{n} istenmeyen karakter kaldırıldı",
  showRemoved: "Kaldırılan karakterleri göster",
  cleanAnother: "Başka Bir Metni Temizle",
  // Footer
  privacy: "Metniniz tarayıcınızda yerel olarak işlenir.",
  byline: "WaweUp tarafından",
  // Top controls
  backLabel: "waweup.com'a geri dön",
  themeToDark: "Koyu temaya geç",
  themeToLight: "Açık temaya geç",
  // FAQ
  faqTitle: "Sık Sorulan Sorular",
  issueLabels: {
    zeroWidth: "Sıfır genişlikli karakterler",
    nbsp: "Bölünmez boşluklar",
    unusualSpaces: "Alışılmadık boşluklar",
    extraSpaces: "Fazladan boşluklar",
    hidden: "Gizli Unicode",
    lineBreaks: "Satır sonu sorunları",
    trailing: "Satır sonundaki boşluklar",
  },
  optionLabels: {
    zeroWidth: "Sıfır genişlikli karakterleri kaldır",
    spaces: "Boşlukları normalleştir",
    hidden: "Gizli Unicode karakterleri kaldır",
    lineBreaks: "Satır sonlarını normalleştir",
    trim: "Satır sonu boşluklarını kırp",
  },
  charNames: {
    Tab: "Sekme (Tab)",
    "Carriage Return": "Satır Başı (CR)",
    "Non-breaking Space": "Bölünmez Boşluk",
    "Soft Hyphen": "Yumuşak Tire",
    "Combining Grapheme Joiner": "Birleştirici Grafem Bağlayıcı",
    "Arabic Letter Mark": "Arapça Harf İşareti",
    "Ogham Space Mark": "Ogham Boşluk İşareti",
    "Mongolian Vowel Separator": "Moğolca Ünlü Ayırıcı",
    "En Quad": "En Quad Boşluk",
    "Em Quad": "Em Quad Boşluk",
    "En Space": "En Boşluk",
    "Em Space": "Em Boşluk",
    "Three-Per-Em Space": "1/3 Em Boşluk",
    "Four-Per-Em Space": "1/4 Em Boşluk",
    "Six-Per-Em Space": "1/6 Em Boşluk",
    "Figure Space": "Rakam Boşluğu",
    "Punctuation Space": "Noktalama Boşluğu",
    "Thin Space": "İnce Boşluk",
    "Hair Space": "Çok İnce Boşluk",
    "Zero Width Space": "Sıfır Genişlikli Boşluk",
    "Zero Width Non-Joiner": "Sıfır Genişlikli Ayırıcı",
    "Zero Width Joiner": "Sıfır Genişlikli Birleştirici",
    "Left-to-Right Mark": "Soldan Sağa İşareti",
    "Right-to-Left Mark": "Sağdan Sola İşareti",
    "Line Separator": "Satır Ayırıcı",
    "Paragraph Separator": "Paragraf Ayırıcı",
    "Left-to-Right Embedding": "Soldan Sağa Gömme",
    "Right-to-Left Embedding": "Sağdan Sola Gömme",
    "Pop Directional Formatting": "Yön Biçimlendirmesini Kapat",
    "Left-to-Right Override": "Soldan Sağa Zorlama",
    "Right-to-Left Override": "Sağdan Sola Zorlama",
    "Narrow No-Break Space": "Dar Bölünmez Boşluk",
    "Medium Mathematical Space": "Orta Matematiksel Boşluk",
    "Word Joiner": "Sözcük Birleştirici",
    "Left-to-Right Isolate": "Soldan Sağa Yalıtım",
    "Right-to-Left Isolate": "Sağdan Sola Yalıtım",
    "First Strong Isolate": "İlk Güçlü Yalıtım",
    "Pop Directional Isolate": "Yön Yalıtımını Kapat",
    "Ideographic Space": "İdeografik Boşluk",
    "Zero Width No-Break Space (BOM)": "Sıfır Genişlikli Bölünmez Boşluk (BOM)",
    "Interlinear Annotation Anchor": "Satır Arası Açıklama Çapası",
    "Interlinear Annotation Separator": "Satır Arası Açıklama Ayırıcı",
    "Interlinear Annotation Terminator": "Satır Arası Açıklama Sonlandırıcı",
    "Control Character": "Kontrol Karakteri",
    "Invisible Character": "Görünmez Karakter",
    "Space (extra)": "Boşluk (fazladan)",
    "Space (trailing)": "Boşluk (satır sonu)",
    "Tab (trailing)": "Sekme (satır sonu)",
  },
  faq: [
    {
      q: "CleanText hangi gizli karakterleri bulur?",
      a: "CleanText; sıfır genişlikli boşlukları, sıfır genişlikli birleştirici ve ayırıcıları, bayt sırası işaretlerini (BOM), yumuşak tireleri, çift yönlü kontrol işaretlerini, bölünmez ve alışılmadık Unicode boşluklarını, kontrol karakterlerini ve belgelerden, web sitelerinden veya yapay zekâ araçlarından metin kopyalarken sıkça karışan diğer görünmez Unicode karakterlerini tespit eder.",
    },
    {
      q: "Metnim bir sunucuya yükleniyor mu?",
      a: "Hayır. Her şey tamamen tarayıcınızda çalışır. Metniniz cihazınızdan asla ayrılmaz, hiçbir şey saklanmaz ve hiçbir sunucuya veri gönderilmez.",
    },
    {
      q: "Gizli karakterler neden önemli?",
      a: "Görünmez karakterler kodu ve yapılandırma dosyalarını bozabilir, biçimlendirme hatalarına yol açabilir, aynı görünen metinlerin karşılaştırmalarda eşleşmemesine neden olabilir, karakter sayısını şişirebilir ve hatta gizli filigran veya takip amacıyla kullanılabilir.",
    },
    {
      q: "Temizlenen metni indirebilir miyim?",
      a: "Evet. Temizleme işleminden sonra sonucu tek tıkla panonuza kopyalayabilir veya düz bir .txt dosyası olarak indirebilirsiniz.",
    },
    {
      q: "CleanText ücretsiz mi?",
      a: "Evet. CleanText, WaweUp tarafından sunulan ücretsiz bir araçtır. Kayıt yok, sınır yok, reklam yok — yapıştırın, temizleyin, kullanın.",
    },
  ],
};

export const dict: Record<Lang, Dict> = { tr, en };

type Vars = Record<string, string | number>;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof Dict, vars?: Vars) => string;
  d: Dict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <SiteChrome>");
  }
  return ctx;
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  // SSR default is "en"; the real language is resolved on mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("waweup-lang");
      if (stored === "tr" || stored === "en") {
        setLangState(stored);
      } else if (navigator.language?.toLowerCase().startsWith("tr")) {
        setLangState("tr");
      }
    } catch {
      // localStorage unavailable — keep the default.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem("waweup-lang", next);
    } catch {
      // Ignore persistence errors.
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const d = dict[lang];
    const t = (key: keyof Dict, vars?: Vars): string => {
      const raw = d[key];
      if (typeof raw !== "string") return String(key);
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
        vars[name] !== undefined ? String(vars[name]) : `{${name}}`
      );
    };
    return { lang, setLang, t, d };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function ArrowLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function PaperPlaneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF6903"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="site-logo__plane"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function TopControls() {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("waweup-theme", next ? "dark" : "light");
    } catch {
      // Ignore persistence errors.
    }
  };

  return (
    <header className="site-header">
      <div className="site-header__left">
        <a
          className="tc-back"
          href="https://waweup.com"
          aria-label={t("backLabel")}
        >
          <ArrowLeftIcon />
          <span className="tc-back__label">waweup.com</span>
        </a>

        <div className="tc-lang" role="group" aria-label="Language">
          <button
            type="button"
            className={lang === "tr" ? "active" : ""}
            aria-pressed={lang === "tr"}
            onClick={() => setLang("tr")}
          >
            TR
          </button>
          <button
            type="button"
            className={lang === "en" ? "active" : ""}
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </div>

      <div className="site-header__center">
        <a className="site-logo" href="/" aria-label="waweup home">
          <span className="site-logo__text">wawe</span>
          <PaperPlaneIcon />
        </a>
      </div>

      <div className="site-header__right">
        <button
          type="button"
          className="tc-theme"
          onClick={toggleTheme}
          aria-label={dark ? t("themeToLight") : t("themeToDark")}
          title={dark ? t("themeToLight") : t("themeToDark")}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
