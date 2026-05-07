import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollText, Send, Sparkles, Loader2, Globe } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { interpretPoetry } from './services/geminiService';
import { LANGUAGES, Language, CATEGORY_IDS, CategoryId, TRANSLATIONS } from './locales';

export default function App() {
  const [lang, setLang] = useState<Language>('zh-TW');
  const [poem, setPoem] = useState('');
  const [category, setCategory] = useState<CategoryId>('career');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const t = TRANSLATIONS[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poem.trim()) {
      setError(t.errorEmpty);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const categoryName = t.categories[category];
      const response = await interpretPoetry(poem, categoryName, lang);
      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.errorFetch);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-serif">
      {/* Header */}
      <header className="bg-surface border-b-4 border-primary shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center text-secondary font-bold text-lg rounded-sm shadow-[2px_2px_0_rgba(0,0,0,0.1)] border border-yellow-500/30">
              {t.headerLogo}
            </div>
            <div className="text-2xl font-bold text-on-surface uppercase tracking-[0.2em] border-l-2 border-primary pl-4 ml-1">
              {t.title}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-primary">
            <Globe className="w-5 h-5 opacity-70" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent border-b border-primary/30 py-1 pl-1 pr-6 focus:outline-none focus:border-primary text-sm font-sans"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-primary font-bold tracking-widest mb-2 uppercase text-sm">
            {t.headerMotto}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-4 tracking-wider leading-tight text-shadow-sm">
            {t.headline}
          </h1>
          <p 
            className="text-on-surface-variant text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t.subtitle }}
          />
        </div>

        <div className="space-y-8">
          {/* Input Card */}
          <section className="bg-surface-container-lowest border border-primary/10 p-8 md:p-10 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <span className="text-8xl font-bold font-serif">{t.watermark}</span>
            </div>
            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              <div>
                <label className="flex items-center gap-2 text-primary font-bold tracking-widest mb-4">
                  <ScrollText className="w-5 h-5" />
                  <span>{t.step1Title}</span>
                </label>
                <textarea
                  value={poem}
                  onChange={(e) => setPoem(e.target.value)}
                  placeholder={t.step1Placeholder}
                  className="w-full bg-transparent border-b-2 border-primary/30 focus:border-secondary focus:ring-0 resize-none py-3 text-lg transition-colors placeholder:text-on-surface-variant/50 outline-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-primary font-bold tracking-widest mb-4">
                  <Sparkles className="w-5 h-5" />
                  <span>{t.step2Title}</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {CATEGORY_IDS.map((catId) => (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => setCategory(catId)}
                      className={`px-6 py-2 border transition-all text-sm font-bold tracking-widest ${
                        category === catId
                          ? 'bg-primary text-white border-primary'
                          : 'bg-transparent text-on-surface border-primary/20 hover:border-primary/50'
                      }`}
                    >
                      {t.categories[catId]}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-error bg-error-container p-3 rounded-sm text-sm border border-error/20">
                  {error}
                </div>
              )}

              <div className="pt-4 border-t border-primary/10">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-secondary text-on-secondary font-bold tracking-widest py-3 px-10 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.loading}
                    </>
                  ) : (
                    <>
                      {t.submitBtn}
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Result Card */}
          <AnimatePresence>
            {result && !loading && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-surface-container-highest border border-primary/20 p-8 md:p-10 shadow-sm relative"
              >
                <div className="mb-6 flex items-center gap-3 border-b border-primary/20 pb-4">
                  <div className="w-8 h-8 bg-primary flex items-center justify-center text-secondary font-bold text-sm">
                    {t.resultTitleIcon}
                  </div>
                  <h2 className="text-2xl font-bold text-primary tracking-widest">
                    {t.resultTitle}
                  </h2>
                </div>
                <div className="markdown-prose text-on-surface text-lg leading-relaxed">
                  <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <footer className="mt-12 py-8 bg-surface-container border-t border-primary/10 text-center text-on-surface-variant text-sm flex flex-col items-center justify-center gap-2">
           <div className="w-6 h-6 border border-primary flex items-center justify-center text-primary font-bold text-[10px] mb-2 opacity-50">{t.footerSeal}</div>
           <p>{t.footerBlessing}</p>
           <p className="opacity-70 text-xs mt-2">{t.footerCopyright}</p>
      </footer>
    </div>
  );
}
