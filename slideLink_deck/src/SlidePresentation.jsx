import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ArrowRight, Sun, Moon, Upload, Cpu, Download, Pencil, Palette, BarChart3, Search, Zap } from 'lucide-react';

/* ─── useScrollReveal ───
   Intersection Observer hook for progressive content reveals.
   Elements with ref attached get `.revealed` class when visible.
*/
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Immediately reveal all elements
      if (ref.current) {
        ref.current.querySelectorAll('.reveal, .reveal-line, .gantt-bar').forEach(el => {
          el.classList.add('revealed');
        });
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px 0px -30px 0px' }
    );

    const el = ref.current;
    if (el) {
      el.querySelectorAll('.reveal, .reveal-line, .gantt-bar').forEach(child => {
        observer.observe(child);
      });
    }

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
};

/* ─── Stagger helper ───
   Returns inline transition-delay style for staggered animations
*/
const stagger = (index, base = 100) => ({
  transitionDelay: `${index * base}ms`,
});

/* ─── Language Context ───
   Provides 'en' or 'jp' to all sections.
   Each section uses: const lang = useLang();
   Then: const t = (en, jp) => lang === 'jp' ? jp : en;
*/
const LanguageContext = React.createContext('en');
const useLang = () => React.useContext(LanguageContext);

/* ═══════════════════════════════════════════════
   SECTION 0 — Title (Hero)
   Full viewport, centered. Dramatic type.
   ═══════════════════════════════════════════════ */
const Section0 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center items-center px-8 relative"
      aria-label="Title"
    >
      <div className="reveal reveal-line h-[2px] bg-[var(--primary-500)] mb-10" />
      <h1 className="reveal text-7xl md:text-8xl font-bold tracking-tight mb-4" style={stagger(1)}>
        <span className="text-[var(--primary-500)]">Slide</span>
        <span className="text-[var(--text-950)]">Link</span>
      </h1>
      <p className="reveal text-[var(--text-600)] text-xl tracking-[0.25em] uppercase font-light mb-3" style={stagger(2)}>
        スライドリンク
      </p>
      <p className="reveal text-[var(--text-700)] text-lg md:text-xl max-w-xl text-center mt-6 leading-relaxed" style={stagger(3)}>
        {t(
          <>{t(<>NotebookLM Quality &bull; Genspark Interaction &bull; Canva Editing</>, <>NotebookLMの品質 &bull; Gensparkの操作性 &bull; Canvaの編集力</>)}</>,
          <>NotebookLMの品質 &bull; Gensparkの操作性 &bull; Canvaの編集力</>
        )}
      </p>
      <div className="reveal absolute bottom-16 flex gap-6 text-[var(--text-400)] font-mono text-sm" style={stagger(4)}>
        <span>Raihan Satria</span>
        <span className="text-[var(--text-300)]">—</span>
        <span>{t('February 2026', '2026年2月')}</span>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 1 — Background
   ═══════════════════════════════════════════════ */
const Section1 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Background"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('01 — CONTEXT', '01 — 背景')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] leading-tight mb-4" style={stagger(1)}>
        {t('Background', '背景')}
      </h2>
      <p className="reveal text-[var(--text-700)] text-lg md:text-xl leading-relaxed max-w-2xl mb-8" style={stagger(2)}>
        {t(
          'How presentations are created today at Honda — the manual, repetitive process everyone endures.',
          '本田技研における現在のプレゼンテーション作成方法 — 誰もが経験する手作業の繰り返し。'
        )}
      </p>

      <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-5" style={stagger(3)}>
        {t('Typical Creation Process', '一般的な作成プロセス')}
      </p>

      <div className="flex flex-wrap items-stretch gap-4 mb-8">
        {[
          { step: '01', title: t('Gather', '収集'), desc: t('Docs, notes, data', '資料・メモ・データ'), time: '1-2h' },
          { step: '02', title: t('Structure', '構成'), desc: t('Outline & flow', '構成案・フロー'), time: '30m' },
          { step: '03', title: t('Design', 'デザイン'), desc: t('Manual PowerPoint', '手動でPPT作成'), time: '2-3h' },
          { step: '04', title: t('Review', '確認'), desc: t('Fix text, layout', 'テキスト・レイアウト修正'), time: '1h' },
          { step: '05', title: t('Translate', '翻訳'), desc: t('JP ↔ EN', '日英翻訳'), time: '1-2h' },
        ].map((item, i) => (
          <React.Fragment key={i}>
            <div className="reveal flex-1 min-w-[140px] border-l-2 border-[var(--background-200)] pl-5" style={stagger(i + 4)}>
              <p className="font-mono text-[var(--text-400)] text-xs mb-1">{item.step}</p>
              <p className="text-[var(--text-950)] font-semibold text-lg">{item.title}</p>
              <p className="text-[var(--text-600)] text-base">{item.desc}</p>
              <p className="font-mono text-[var(--warning-muted)] text-sm mt-2">~{item.time}</p>
            </div>
            {i < 4 && <ArrowRight className="w-4 h-4 text-[var(--text-300)] self-center flex-shrink-0 hidden md:block" />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-wrap gap-12">
        {[
          { label: t('4-8 hours', '4〜8時間'), desc: t('Per presentation', '1プレゼンあたり'), color: 'text-[var(--danger-muted)]' },
          { label: t('Text-heavy', 'テキスト過多'), desc: t('Rushing to deadline', '締切に追われる'), color: 'text-[var(--warning-muted)]' },
          { label: t('Weekly', '毎週'), desc: t('Same process repeats', '同じ作業の繰り返し'), color: 'text-[var(--text-600)]' },
        ].map((stat, i) => (
          <div key={i} className="reveal" style={stagger(i + 9)}>
            <p className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.label}</p>
            <p className="text-[var(--text-600)] text-base mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 2 — Problem
   ═══════════════════════════════════════════════ */
const Section2 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Problem"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-6 tracking-wide" style={stagger(0)}>{t('02 — PROBLEM', '02 — 課題')}</p>
      <h2 className="reveal text-3xl md:text-4xl font-bold text-[var(--danger-muted)] leading-snug max-w-3xl mb-8" style={stagger(1)}>
        {t(
          'Presenters spend hours on slide creation instead of focusing on their actual work.',
          '発表者はスライド作成に何時間も費やし、本来の業務に集中できていません。'
        )}
      </h2>

      <div className="flex flex-col gap-6 mb-8">
        {[
          { title: t('Business Trip Burden', '出張報告の負担'), body: t('6+ hours per business trip report. Companies send 2-3 people just to share the slide-making workload.', '出張報告書に6時間以上。スライド作成の負担を分担するため、2〜3人を派遣しています。') },
          { title: t('Non-Editable Output', '編集不可の出力'), body: t("NotebookLM outputs are screenshots — paste to PPT as images, then discover errors you can't fix. SlideLink renders to HTML canvas with Point & Edit: click any element, describe the fix, AI applies it instantly.", 'NotebookLMの出力はスクリーンショット — PPTに画像として貼り付けた後、修正できないエラーを発見。SlideLinkはHTMLキャンバスにレンダリングし、Point & Editで要素をクリック、修正内容を入力するとAIが即座に適用します。') },
          { title: t('Layout Breaks on Translation', '翻訳時のレイアウト崩れ'), body: t('Bilingual communicators lose formatting every time. Translation destroys slide positioning and text sizing.', 'バイリンガルのコミュニケーターは翻訳のたびにフォーマットを失います。翻訳がスライドの配置やテキストサイズを破壊します。') },
        ].map((item, i) => (
          <div key={i} className="reveal border-l-2 border-[var(--primary-400)] pl-8" style={stagger(i + 2)}>
            <p className="text-[var(--text-950)] font-semibold text-lg mb-1">{item.title}</p>
            <p className="text-[var(--text-700)] text-base leading-relaxed max-w-2xl">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="reveal flex items-center gap-5 pt-5 border-t border-[var(--background-200)]" style={stagger(5)}>
        <div className="w-1 h-10 bg-[var(--primary-500)] rounded-full flex-shrink-0" />
        <p className="text-[var(--text-800)] text-lg italic leading-relaxed">
          {t(
            '"When NotebookLM\'s graph and content is wrong, I can\'t edit it. I have to start over."',
            '「NotebookLMのグラフや内容に誤りがあっても編集できず、最初からやり直すしかありません。」'
          )}
        </p>
        <p className="text-[var(--text-400)] font-mono text-sm ml-auto whitespace-nowrap">{t('— Suzuki-san, Analyst', '— 鈴木さん（アナリスト）')}</p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 3 — Related Work
   ═══════════════════════════════════════════════ */
const Section3 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Related Work"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('03 — LANDSCAPE', '03 — 関連事例')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-8" style={stagger(1)}>{t('Related Work', '関連事例')}</h2>

      <div className="reveal w-full max-w-5xl" style={stagger(2)}>
        {/* Header */}
        <div className="grid grid-cols-5 border-b border-[var(--background-200)] pb-4 mb-1">
          <div className="font-mono text-[var(--text-400)] text-sm">{t('FEATURE', '機能')}</div>
          <div className="text-center font-semibold text-[var(--info-blue)]">MS Copilot</div>
          <div className="text-center font-semibold text-[var(--info-green)]">NotebookLM</div>
          <div className="text-center font-semibold text-[var(--info-purple)]">Genspark AI</div>
          <div className="text-center font-semibold text-[var(--primary-500)]">SlideLink</div>
        </div>
        {/* Rows */}
        {[
          { feature: t('Document to slides', '文書からスライド'), vals: ['✓', '✓', '✓', '✓'] },
          { feature: t('Research before generate', '生成前のリサーチ'), vals: ['—', '—', '—', '✓'] },
          { feature: t('Editable output', '編集可能な出力'), vals: ['✓', '✗', '✓', '✓'] },
          { feature: t('Multi-agent system', 'マルチエージェント'), vals: ['—', '—', '—', '✓'] },
          { feature: t('Chat + Canvas editing', 'チャット＋キャンバス編集'), vals: ['—', '—', '—', '✓'] },
          { feature: t('Layout-preserving translation', 'レイアウト保持翻訳'), vals: ['✗', '—', '—', '✓'] },
          { feature: t('Brand template enforcement', 'ブランドテンプレート'), vals: ['✓', '—', '✓', '✓'] },
          { feature: t('Native PPTX charts', 'ネイティブPPTXチャート'), vals: ['✓', '—', '—', '✓'] },
          { feature: t('Internal deployment', '社内デプロイ'), vals: ['—', '✗', '✗', '✓'] },
        ].map((row, i) => (
          <div key={i} className="reveal grid grid-cols-5 border-b border-[var(--background-100)] py-3 text-base" style={stagger(i + 3)}>
            <div className="text-[var(--text-800)]">{row.feature}</div>
            {row.vals.map((v, j) => (
              <div key={j} className={`text-center ${v === '✓' ? (j === 3 ? 'text-[var(--primary-500)] font-semibold' : 'text-[var(--info-green)]') : v === '✗' ? 'text-[var(--danger)]' : 'text-[var(--text-400)]'}`}>
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="reveal mt-8 pt-5 border-t border-[var(--background-200)]" style={stagger(14)}>
        <p className="text-[var(--warning)] text-lg md:text-xl font-medium max-w-4xl">
          {t(
            'Gap: No tool combines NotebookLM-quality generation + chat-based + canvas editing + native PPTX export + internal deployment.',
            'ギャップ：NotebookLM品質の生成＋チャット＋キャンバス編集＋ネイティブPPTX出力＋社内デプロイを兼ね備えたツールは存在しません。'
          )}
        </p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 4 — Solution: The Best of Three Worlds
   ═══════════════════════════════════════════════ */
const Section4 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Solution"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('04 — SOLUTION', '04 — ソリューション')}</p>
      <h2 className="reveal text-5xl md:text-6xl font-bold mb-2" style={stagger(1)}>
        <span className="text-[var(--primary-500)]">Slide</span>
        <span className="text-[var(--text-950)]">Link</span>
      </h2>
      <p className="reveal text-[var(--text-700)] text-xl md:text-2xl mb-8" style={stagger(2)}>{t('The Best of Three Worlds', '3つの世界のベスト')}</p>

      {/* Three-world fusion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* NotebookLM */}
        <div className="reveal border border-[var(--background-200)] p-6" style={stagger(3)}>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase">{t('From NotebookLM', 'NotebookLMから')}</p>
              <h3 className="text-xl font-bold text-[var(--text-950)]">{t('Quality Output', '高品質な出力')}</h3>
            </div>
          </div>
          <div className="space-y-2 text-[var(--text-600)] text-base">
            <p>&bull; {t('AI-generated visuals via Gemini', 'GeminiによるAI生成ビジュアル')}</p>
            <p>&bull; {t('Smart content extraction', 'インテリジェントなコンテンツ抽出')}</p>
            <p>&bull; {t('Professional, polished layouts', 'プロフェッショナルで洗練されたレイアウト')}</p>
            <p>&bull; {t('High-quality image generation', '高品質な画像生成')}</p>
          </div>
        </div>

        {/* Genspark */}
        <div className="reveal border border-[var(--background-200)] p-6" style={stagger(4)}>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase">{t('From Genspark', 'Gensparkから')}</p>
              <h3 className="text-xl font-bold text-[var(--text-950)]">{t('Chat Interaction', 'チャットインタラクション')}</h3>
            </div>
          </div>
          <div className="space-y-2 text-[var(--text-600)] text-base">
            <p>&bull; {t('Chat-based AI conversation', 'チャットベースのAI会話')}</p>
            <p>&bull; {t('Agent chain-of-thought visible', 'エージェントの思考過程を可視化')}</p>
            <p>&bull; {t('"Point & Edit" — click to modify', '「Point & Edit」— クリックで修正')}</p>
            <p>&bull; {t('Natural language commands', '自然言語コマンド')}</p>
          </div>
        </div>

        {/* Canva */}
        <div className="reveal border border-[var(--background-200)] p-6" style={stagger(5)}>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase">{t('From Canva', 'Canvaから')}</p>
              <h3 className="text-xl font-bold text-[var(--text-950)]">{t('Direct Editing', 'ダイレクト編集')}</h3>
            </div>
          </div>
          <div className="space-y-2 text-[var(--text-600)] text-base">
            <p>&bull; {t('Drag & drop on canvas', 'キャンバス上でドラッグ＆ドロップ')}</p>
            <p>&bull; {t('Resize with handles', 'ハンドルでリサイズ')}</p>
            <p>&bull; {t('Properties panel controls', 'プロパティパネルで制御')}</p>
            <p>&bull; {t('Real-time preview', 'リアルタイムプレビュー')}</p>
          </div>
        </div>
      </div>

      {/* The unique addition */}
      <div className="reveal bg-[var(--primary-500)] p-6 mb-6" style={stagger(6)}>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-white/80 font-mono text-xs tracking-widest uppercase">{t('SlideLink Unique', 'SlideLink独自')}</p>
            <p className="text-white text-xl font-bold">{t('Fully Editable PPTX Export — Native charts, not screenshots', '完全編集可能なPPTXエクスポート — スクリーンショットではなくネイティブチャート')}</p>
          </div>
        </div>
      </div>

      {/* Multi-agent mention */}
      <div className="reveal flex items-center gap-4 pt-5 border-t border-[var(--background-200)]" style={stagger(7)}>
        <span className="w-2.5 h-2.5 bg-[var(--accent-500)] rounded-full" />
        <span className="text-[var(--text-950)] font-semibold text-lg">{t('Powered by Multi-Agent AI', 'マルチエージェントAIで駆動')}</span>
        <p className="text-[var(--text-600)] text-base">{t('Four specialized agents: Builder, Designer, Analyst, Researcher — working together', '4つの専門エージェント：Builder、Designer、Analyst、Researcher — 連携して動作')}</p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION — Why SlideLink (Value Proposition)
   ═══════════════════════════════════════════════ */
const SectionWhySlideLink = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Why SlideLink"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('04B — VALUE', '04B — 価値')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-8" style={stagger(1)}>{t('Why SlideLink?', 'なぜSlideLinkなのか？')}</h2>

      {/* Competitor limitations */}
      <div className="space-y-4 mb-8">
        {[
          { name: 'NotebookLM', issue: t("Beautiful output, but CAN'T EDIT — it's a screenshot", '美しい出力だが編集不可 — スクリーンショットのため'), color: 'text-[var(--danger-muted)]' },
          { name: 'Genspark', issue: t('Can edit via chat, but BASIC VISUALS — no brand templates', 'チャットで編集可能だがビジュアルが基本的 — ブランドテンプレートなし'), color: 'text-[var(--warning)]' },
          { name: 'Canva', issue: t('Great editor, but NO AI GENERATION — start from blank', '優れたエディタだがAI生成なし — 白紙からスタート'), color: 'text-[var(--warning)]' },
          { name: 'Copilot', issue: t('Inside PowerPoint, but BREAKS LAYOUTS on translation', 'PowerPoint内で動作するが翻訳時にレイアウトが崩れる'), color: 'text-[var(--warning)]' },
        ].map((item, i) => (
          <div key={i} className="reveal flex items-center gap-4" style={stagger(i + 2)}>
            <span className="w-28 text-right text-[var(--text-800)] font-semibold">{item.name}</span>
            <span className="text-[var(--text-400)]">&rarr;</span>
            <span className={`${item.color} text-base`}>{item.issue}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="reveal h-[2px] bg-[var(--primary-500)] w-32 mb-8" style={stagger(6)} />

      {/* SlideLink answer */}
      <div className="reveal flex items-start gap-6 mb-8" style={stagger(7)}>
        <span className="text-5xl font-bold text-[var(--primary-500)]">SlideLink</span>
        <div className="text-[var(--text-800)] text-xl leading-relaxed">
          <p className="font-semibold">{t('Beautiful output that you CAN edit', '美しい出力を編集可能に')}</p>
          <p className="text-[var(--text-600)]">{t('via chat OR direct manipulation', 'チャットまたはダイレクト操作で')}</p>
          <p className="text-[var(--text-600)]">{t('with native PPTX export', 'ネイティブPPTXエクスポート付き')}</p>
        </div>
      </div>

      {/* Honda benefits */}
      <div className="reveal grid grid-cols-3 gap-6 pt-6 border-t border-[var(--background-200)]" style={stagger(8)}>
        {[
          { label: t('Your GCP', '御社のGCP'), desc: t('Runs on Honda infrastructure', 'Hondaインフラ上で稼働') },
          { label: t('Your Gemini', '御社のGemini'), desc: t('Uses your existing API', '既存のAPIを使用') },
          { label: t('Your Brand', '御社のブランド'), desc: t('Honda templates built-in', 'Hondaテンプレート内蔵') },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div>
              <p className="text-[var(--text-950)] font-semibold">{item.label}</p>
              <p className="text-[var(--text-600)] text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 5 — Target Users
   ═══════════════════════════════════════════════ */
const Section5 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Target Users"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('07 — USERS', '07 — ユーザー')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-8" style={stagger(1)}>{t('Target Users', 'ターゲットユーザー')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: user types */}
        <div className="space-y-6">
          {[
            { label: t('Deadline Presenters', '締切に追われる発表者'), desc: t('Need slides fast, no time for manual design', 'スライドを素早く作成、手動デザインの時間なし') },
            { label: t('Content-Rich Presenters', 'データ重視の発表者'), desc: t('Have data, need readable visual format', 'データはあるが、見やすいビジュアル形式が必要') },
            { label: t('Bilingual Communicators', 'バイリンガル担当者'), desc: t('Present same content in JP ↔ EN', '同じ内容を日英両言語で発表') },
          ].map((u, i) => (
            <div key={i} className="reveal border-l-2 border-[var(--primary-400)] pl-6" style={stagger(i + 2)}>
              <p className="text-[var(--text-950)] font-semibold text-xl">{u.label}</p>
              <p className="text-[var(--text-600)] text-lg mt-1">{u.desc}</p>
            </div>
          ))}
        </div>

        {/* Right: before/after */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-5" style={stagger(5)}>
            {t('Monthly Report — Before vs After', '月次報告 — 導入前 vs 導入後')}
          </p>

          <div className="reveal mb-5" style={stagger(6)}>
            <span className="font-mono text-xs text-[var(--danger-muted)] tracking-widest uppercase">{t('Before', '導入前')}</span>
            <div className="flex items-center gap-2 mt-3">
              {[t('Read 2h', '読込 2h'), t('Outline 1h', '構成 1h'), t('Design 3h', 'デザイン 3h'), t('Translate 2h', '翻訳 2h')].map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex-1 bg-[var(--background-100)] py-3 px-3 text-center">
                    <p className="text-[var(--text-800)] text-sm font-medium">{s.split(' ')[0]}</p>
                    <p className="text-[var(--text-500)] font-mono text-xs mt-1">{s.split(' ')[1]}</p>
                  </div>
                  {i < 3 && <ArrowRight className="w-3 h-3 text-[var(--text-300)] flex-shrink-0" />}
                </React.Fragment>
              ))}
              <ArrowRight className="w-3 h-3 text-[var(--text-300)] flex-shrink-0" />
              <div className="bg-[var(--danger-bg)] py-3 px-4 text-center">
                <p className="text-[var(--danger)] font-bold text-lg font-mono">~5h</p>
              </div>
            </div>
          </div>

          <div className="reveal mb-6" style={stagger(7)}>
            <span className="font-mono text-xs text-[var(--primary-500)] tracking-widest uppercase">{t('After — with SlideLink', '導入後 — SlideLink使用')}</span>
            <div className="flex items-center gap-2 mt-3">
              {[t('Upload 1m', 'アップロード 1m'), t('Generate 3m', '生成 3m'), t('Edit 15m', '編集 15m'), t('Translate 5m', '翻訳 5m')].map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex-1 bg-[var(--primary-100)] py-3 px-3 text-center">
                    <p className="text-[var(--text-800)] text-sm font-medium">{s.split(' ')[0]}</p>
                    <p className="text-[var(--primary-500)] font-mono text-xs mt-1">{s.split(' ')[1]}</p>
                  </div>
                  {i < 3 && <ArrowRight className="w-3 h-3 text-[var(--text-300)] flex-shrink-0" />}
                </React.Fragment>
              ))}
              <ArrowRight className="w-3 h-3 text-[var(--text-300)] flex-shrink-0" />
              <div className="bg-[var(--primary-500)] py-3 px-4 text-center">
                <p className="text-white font-bold text-lg font-mono">~25m</p>
              </div>
            </div>
          </div>

          <div className="reveal flex items-end justify-end gap-3" style={stagger(8)}>
            <p className="text-6xl md:text-7xl font-bold text-[var(--accent-500)] font-mono">95%</p>
            <p className="text-[var(--text-600)] text-lg mb-2">{t('time savings', '時間削減')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 6 — User Personas
   ═══════════════════════════════════════════════ */
const Section6 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex"
      aria-label="User Personas"
    >
      {/* Tanaka */}
      <div className="w-1/2 flex flex-col justify-center px-10 md:px-14 py-10 border-r border-[var(--background-200)]">
        <p className="reveal font-mono text-[var(--primary-500)] text-xs tracking-widest uppercase mb-5" style={stagger(0)}>{t('Persona A', 'ペルソナ A')}</p>
        <h3 className="reveal text-3xl md:text-4xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>Tanaka-san</h3>
        <p className="reveal text-[var(--primary-500)] text-lg mb-6" style={stagger(2)}>{t('Senior Engineer / Strategist', 'シニアエンジニア / 戦略担当')}</p>

        <div className="reveal border-l-2 border-[var(--primary-400)] pl-6 mb-6" style={stagger(3)}>
          <p className="text-[var(--text-800)] text-lg italic leading-relaxed">
            {t(
              '"I spend more time making slides than absorbing content on business trips"',
              '「出張ではスライド作成に、内容の理解より多くの時間を費やしています」'
            )}
          </p>
        </div>

        <div className="reveal mb-5" style={stagger(4)}>
          <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-3">{t('Current Workflow', '現在のワークフロー')}</p>
          <div className="flex items-center gap-3 text-base flex-wrap">
            <span className="text-[var(--primary-600)] bg-[var(--primary-100)] px-3 py-1.5">ChatGPT</span>
            <span className="text-[var(--text-400)]">→</span>
            <span className="text-[var(--text-800)] bg-[var(--background-100)] px-3 py-1.5">{t('Get outline', 'アウトライン取得')}</span>
            <span className="text-[var(--text-400)]">→</span>
            <span className="text-[var(--danger)] bg-[var(--danger-bg)] px-3 py-1.5">{t('Build from scratch', 'ゼロから作成')}</span>
          </div>
        </div>

        <p className="reveal text-[var(--text-500)] text-base leading-relaxed" style={stagger(5)}>
          {t(
            'Company sends 2-3 people on business trips just to share the report workload.',
            '報告書作成の負担を分担するため、会社は2〜3人を出張に派遣しています。'
          )}
        </p>
      </div>

      {/* Suzuki */}
      <div className="w-1/2 flex flex-col justify-center px-10 md:px-14 py-10">
        <p className="reveal font-mono text-[var(--warning-muted)] text-xs tracking-widest uppercase mb-5" style={stagger(0)}>{t('Persona B', 'ペルソナ B')}</p>
        <h3 className="reveal text-3xl md:text-4xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>Suzuki-san</h3>
        <p className="reveal text-[var(--warning)] text-lg mb-6" style={stagger(2)}>{t('Analyst / Researcher', 'アナリスト / リサーチャー')}</p>

        <div className="reveal border-l-2 border-[var(--warning-muted)] pl-6 mb-6" style={stagger(3)}>
          <p className="text-[var(--text-800)] text-lg italic leading-relaxed">
            {t(
              '"When NotebookLM\'s graph and content is wrong, I can\'t edit it. I have to start over."',
              '「NotebookLMのグラフや内容に誤りがあっても編集できず、最初からやり直すしかありません。」'
            )}
          </p>
        </div>

        <div className="reveal mb-5" style={stagger(4)}>
          <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-3">{t('Current Workflow', '現在のワークフロー')}</p>
          <div className="flex items-center gap-3 text-base flex-wrap">
            <span className="text-[var(--warning)] bg-[var(--warning-bg)] px-3 py-1.5">NotebookLM</span>
            <span className="text-[var(--text-400)]">→</span>
            <span className="text-[var(--text-800)] bg-[var(--background-100)] px-3 py-1.5">{t('Screenshot', 'スクリーンショット')}</span>
            <span className="text-[var(--text-400)]">→</span>
            <span className="text-[var(--danger)] bg-[var(--danger-bg)] px-3 py-1.5">{t('Paste to PPT', 'PPTに貼り付け')}</span>
          </div>
        </div>

        <p className="reveal text-[var(--text-500)] text-base leading-relaxed" style={stagger(5)}>
          {t(
            'Screenshots are not editable — errors require starting completely over.',
            'スクリーンショットは編集不可 — エラーがあれば最初から完全にやり直す必要があります。'
          )}
        </p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 7 — Journey: Business Trip
   ═══════════════════════════════════════════════ */
const Section7 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="User Journey: Business Trip"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-2 tracking-wide" style={stagger(0)}>{t('09 — USER JOURNEY', '09 — ユーザージャーニー')}</p>
      <h2 className="reveal text-3xl md:text-4xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Business Trip Attendee', '出張参加者')}</h2>
      <p className="reveal text-[var(--text-600)] text-base mb-4" style={stagger(2)}>{t("Tanaka-san's workflow transformation", '田中さんのワークフロー変革')}</p>

      <div className="reveal flex items-center gap-4 mb-5 pb-4 border-b border-[var(--background-200)]" style={stagger(3)}>
        <div className="w-1 h-8 bg-[var(--primary-500)] rounded-full flex-shrink-0" />
        <p className="text-[var(--text-800)] text-base italic leading-relaxed">
          {t('"One of my pain points for attending a business trip is to create the report, which takes time and takes extra time of my work to present to the management."', '「出張のペインポイントの一つは報告書の作成です。時間がかかり、マネジメントへの報告のために本来の業務の時間を奪われます。」')}
        </p>
        <p className="text-[var(--text-400)] font-mono text-xs ml-auto whitespace-nowrap">{t('— Tanaka-san, Senior Engineer', '— 田中さん（シニアエンジニア）')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        {/* Pre-trip */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-3" style={stagger(4)}>{t('Pre-Trip Pitch', '出張前ピッチ')}</p>
          <div className="reveal mb-3" style={stagger(5)}>
            <span className="font-mono text-xs text-[var(--danger-muted)] tracking-widest uppercase">Before</span>
            <div className="flex items-center gap-2 mt-2">
              {['Research 1-2h', 'AI outline 30m', 'Build 3-4h'].map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex-1 border border-[var(--background-200)] py-1.5 px-2 text-center">
                    <p className="text-[var(--text-800)] text-sm">{s.split(' ')[0]}</p>
                    <p className="text-[var(--text-500)] font-mono text-xs">{s.split(' ').slice(1).join(' ')}</p>
                  </div>
                  {i < 2 && <span className="text-[var(--text-300)]">→</span>}
                </React.Fragment>
              ))}
              <span className="text-[var(--text-300)] ml-1">→</span>
              <span className="text-[var(--danger)] font-mono font-bold text-lg">~6h</span>
            </div>
          </div>
          <div className="reveal" style={stagger(6)}>
            <span className="font-mono text-xs text-[var(--primary-500)] tracking-widest uppercase">After</span>
            <div className="flex items-center gap-2 mt-2">
              {['Goals+URL 10m', 'AI pitch 5m', 'Edit 15m'].map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex-1 border border-[var(--primary-300)] bg-[var(--primary-100)]/30 py-1.5 px-2 text-center">
                    <p className="text-[var(--primary-600)] text-sm">{s.split(' ')[0]}</p>
                    <p className="text-[var(--primary-500)] font-mono text-xs">{s.split(' ').slice(1).join(' ')}</p>
                  </div>
                  {i < 2 && <span className="text-[var(--text-300)]">→</span>}
                </React.Fragment>
              ))}
              <span className="text-[var(--text-300)] ml-1">→</span>
              <span className="text-[var(--primary-500)] font-mono font-bold text-lg">~30m</span>
            </div>
          </div>
        </div>

        {/* Post-trip */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-3" style={stagger(4)}>{t('Post-Trip Report', '出張後レポート')}</p>
          <div className="reveal grid grid-cols-2 gap-3" style={stagger(7)}>
            <div className="border border-[var(--background-200)] p-3">
              <span className="font-mono text-xs text-[var(--danger-muted)] tracking-widest uppercase">Before</span>
              <div className="mt-2 space-y-1 text-[var(--text-700)] text-sm">
                <p>{t('3 people attend', '3人が参加')}</p>
                <p>{t('Each writes part (2-3h)', '各自が担当分を執筆（2-3h）')}</p>
                <p>{t('Combine & reconcile', '統合・調整')}</p>
              </div>
              <p className="mt-2 text-[var(--danger)] font-mono font-bold text-sm">6-9h, 3× cost</p>
            </div>
            <div className="border border-[var(--primary-300)] bg-[var(--primary-100)]/20 p-3">
              <span className="font-mono text-xs text-[var(--primary-500)] tracking-widest uppercase">After</span>
              <div className="mt-2 space-y-1 text-[var(--text-700)] text-sm">
                <p>{t('1 person, 100% focus', '1人で100%集中')}</p>
                <p>{t('Upload notes or images → AI', 'メモや画像をアップロード → AI')}</p>
                <p>{t('Point & Edit (20m)', 'Point & Edit（20分）')}</p>
              </div>
              <p className="mt-2 text-[var(--primary-500)] font-mono font-bold text-sm">~25m, 1× cost</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROI numbers */}
      <div className="flex flex-wrap gap-10 pt-4 border-t border-[var(--background-200)]">
        {[
          { num: '66%', label: t('Travel budget reduction', '出張予算削減') },
          { num: '95%', label: t('Time savings on reports', 'レポート作成時間削減') },
          { num: '100%', label: t('Focus on business trip', '出張業務に集中') },
        ].map((s, i) => (
          <div key={i} className="reveal" style={stagger(i + 8)}>
            <p className="text-3xl md:text-4xl font-bold font-mono text-[var(--accent-500)]">{s.num}</p>
            <p className="text-[var(--text-500)] text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Agentic Capability callout */}
      <div className="reveal mt-4 pt-4 border-t border-[var(--background-200)]" style={stagger(11)}>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-2.5 h-2.5 bg-[var(--primary-500)] rounded-full" />
          <span className="text-[var(--text-950)] font-semibold text-base">{t('Agentic Capability', 'エージェント機能')}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: t('Input', '入力'), desc: t('Department goals + Event URL', '部門目標＋イベントURL') },
            { step: t('AI Fetches', 'AI取得'), desc: t('Agenda, speakers, topics from web', 'アジェンダ・講演者・トピックをWebから取得') },
            { step: t('AI Analyzes', 'AI分析'), desc: t('Alignment between goals and event', '目標とイベントの整合性を分析') },
            { step: t('Output', '出力'), desc: t('Ready-to-present pitch slides with Honda template', 'Hondaテンプレートで発表準備完了のピッチスライド') },
          ].map((item, i) => (
            <div key={i} className="reveal border border-[var(--primary-300)] bg-[var(--primary-100)]/20 p-3" style={stagger(i + 12)}>
              <p className="font-mono text-xs text-[var(--primary-500)] tracking-widest uppercase mb-1">{item.step}</p>
              <p className="text-[var(--text-700)] text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 8 — Journey: Data Presenter
   ═══════════════════════════════════════════════ */
const Section8 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="User Journey: Data Presenter"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-2 tracking-wide" style={stagger(0)}>{t('10 — USER JOURNEY', '10 — ユーザージャーニー')}</p>
      <h2 className="reveal text-3xl md:text-4xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Data Presenter', 'データプレゼンター')}</h2>
      <p className="reveal text-[var(--text-600)] text-base mb-6" style={stagger(2)}>{t("Suzuki-san's workflow transformation", '鈴木さんのワークフロー変革')}</p>

      {/* Before */}
      <div className="reveal mb-5" style={stagger(3)}>
        <span className="font-mono text-xs text-[var(--danger-muted)] tracking-widest uppercase">{t('Before — Hacky Workflow', 'Before — 非効率なワークフロー')}</span>
        <div className="flex items-center gap-2 mt-4">
          {[
            { t: 'Upload data', s: '5m' },
            { t: 'NLM generates', s: '2m' },
            { t: 'Screenshot→PPT', s: '5m' },
            { t: 'Error found!', s: "Can't edit" },
          ].map((item, i) => (
            <React.Fragment key={i}>
              <div className={`flex-1 border py-2 px-3 text-center ${i === 3 ? 'border-[var(--danger-border)] text-[var(--danger)]' : 'border-[var(--background-200)]'}`}>
                <p className="text-[var(--text-800)] text-sm">{item.t}</p>
                <p className="text-[var(--text-500)] font-mono text-xs">{item.s}</p>
              </div>
              {i < 3 && <span className="text-[var(--text-300)]">→</span>}
            </React.Fragment>
          ))}
          <span className="text-[var(--text-300)] ml-1">→</span>
          <div className="bg-[var(--danger-bg)] border border-[var(--danger-border)] py-2 px-4 text-center">
            <p className="text-[var(--danger)] font-bold text-sm">Start over</p>
            <p className="text-[var(--danger-muted)] font-mono text-xs">30-60m+</p>
          </div>
        </div>
      </div>

      {/* After */}
      <div className="reveal mb-6" style={stagger(4)}>
        <span className="font-mono text-xs text-[var(--primary-500)] tracking-widest uppercase">{t('After — With SlideLink', 'After — SlideLinkを使って')}</span>
        <div className="flex items-center gap-2 mt-3">
          {[
            { t: 'Upload data', s: '5m' },
            { t: 'AI generates', s: '2m' },
            { t: 'Point & Edit', s: '"Fix Y-axis"' },
          ].map((item, i) => (
            <React.Fragment key={i}>
              <div className="flex-1 border border-[var(--primary-300)] bg-[var(--primary-100)]/30 py-2 px-3 text-center">
                <p className="text-[var(--primary-600)] text-sm">{item.t}</p>
                <p className="text-[var(--primary-500)] font-mono text-xs">{item.s}</p>
              </div>
              {i < 2 && <span className="text-[var(--text-300)]">→</span>}
            </React.Fragment>
          ))}
          <span className="text-[var(--text-300)] ml-1">→</span>
          <div className="bg-[var(--primary-500)] py-2 px-6 text-center">
            <p className="text-white font-bold text-sm">Done!</p>
            <p className="text-white/80 font-mono text-xs">~10m</p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="reveal mb-6" style={stagger(5)}>
        <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-3">{t('Key Differentiator', '主な差別化要因')}</p>
        <div className="border border-[var(--background-200)] max-w-2xl">
          <div className="grid grid-cols-3 bg-[var(--background-100)] border-b border-[var(--background-200)]">
            <div className="p-3 text-[var(--text-500)] font-mono text-sm">{t('Feature', '機能')}</div>
            <div className="p-3 text-[var(--text-500)] text-center text-sm">NotebookLM</div>
            <div className="p-3 text-[var(--primary-500)] text-center font-semibold text-sm">SlideLink</div>
          </div>
          {[
            [t('Output format', '出力形式'), 'PDF / Image', t('Editable PPTX', '編集可能PPTX')],
            [t('Fix errors', 'エラー修正'), t('Start over', 'やり直し'), 'Point & Edit'],
            [t('Export to PPT', 'PPTへのエクスポート'), t('Screenshot', 'スクリーンショット'), t('Native PPTX', 'ネイティブPPTX')],
          ].map(([feat, nlm, sl], i) => (
            <div key={i} className="grid grid-cols-3 border-b border-[var(--background-100)] last:border-0">
              <div className="p-3 text-[var(--text-800)] text-base">{feat}</div>
              <div className="p-3 text-[var(--danger)] text-center text-base">{nlm}</div>
              <div className="p-3 text-[var(--primary-500)] text-center font-medium text-base">{sl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pull quote */}
      <div className="reveal flex items-center gap-5 pt-5 border-t border-[var(--background-200)]" style={stagger(6)}>
        <div className="w-1 h-8 bg-[var(--primary-500)] rounded-full flex-shrink-0" />
        <p className="text-[var(--text-900)] text-lg italic">
          {t(<>"AI will make mistakes. The question is: <span className="text-[var(--accent-500)] font-bold">how easy is it to fix them?</span>"</>, <>"AIはミスをします。問題は：<span className="text-[var(--accent-500)] font-bold">それをどれだけ簡単に修正できるか？</span>"</>)}
        </p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 9 — System Framework (Multi-Agent Animated)
   INPUT → ORCHESTRATOR → fan-out 4 agents → fan-in → RENDERER → OUTPUT
   ═══════════════════════════════════════════════ */
const Section9 = () => {
  const revealRef = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  const sectionRef = useRef(null);
  const [phase, setPhase] = useState(-1);

  const agents = [
    { name: 'Builder', icon: Pencil, color: 'var(--primary-500)' },
    { name: 'Design', icon: Palette, color: 'var(--info-purple)' },
    { name: 'Data', icon: BarChart3, color: 'var(--info-blue)' },
    { name: 'Research', icon: Search, color: 'var(--info-green)' },
  ];

  // Intersection Observer — start/stop animation
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setPhase(5); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPhase(0);
        else { setPhase(-1); }
      },
      { threshold: 0.5 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Phase timer — advances every 2s
  useEffect(() => {
    if (phase === -1) return;
    const timer = setTimeout(() => {
      setPhase(p => (p >= 5 ? 0 : p + 1));
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  const phaseLabels = [
    t('Receiving documents...', 'ドキュメント受信中...'),
    t('Orchestrator analyzing & decomposing tasks...', 'オーケストレーターがタスクを分析・分解中...'),
    t('Agents working in parallel...', 'エージェントが並列処理中...'),
    t('Progressive canvas rendering...', 'キャンバスをプログレッシブレンダリング中...'),
    t('Output ready!', '出力完了！'),
    t('Point & Edit — route to agent & refine', 'Point & Edit — エージェントに振り分けて修正'),
  ];

  return (
    <section
      ref={(el) => { sectionRef.current = el; revealRef.current = el; }}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="System Framework"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('13 — ARCHITECTURE', '13 — アーキテクチャ')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-2" style={stagger(1)}>{t('Multi-Agent Architecture', 'マルチエージェントアーキテクチャ')}</h2>

      {/* Phase status label */}
      <div className="h-8 mb-3">
        {phase >= 0 && (
          <p key={phase} className="arch-label-enter text-[var(--primary-500)] text-base font-medium">
            {phaseLabels[phase]}
          </p>
        )}
      </div>

      {/* Phase progress indicator */}
      <div className="flex gap-2 mb-5">
        {[t('Input','入力'), t('Orchestrate','オーケストレート'), t('Agents','エージェント'), t('Render','レンダリング'), t('Output','出力'), t('Edit','編集')].map((label, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1 rounded-full transition-all duration-500 ${
              phase >= i ? 'bg-[var(--primary-500)]' : 'bg-[var(--background-200)]'
            }`} />
            <p className={`text-[10px] mt-1 text-center font-mono transition-colors duration-500 ${
              phase === i ? 'text-[var(--primary-500)]' : 'text-[var(--text-400)]'
            }`}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Multi-Agent Flow Diagram ── */}
      <div className="relative">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, var(--text-400) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        <div className="reveal relative z-10 mb-5" style={stagger(2)}>
          <div className="flex items-stretch gap-0">

            {/* STAGE 1: INPUT */}
            <div className={`arch-stage flex-[0.8] border p-3 rounded-l transition-all duration-500 ${
              phase === 0 ? 'border-[var(--primary-500)] shadow-[0_0_15px_rgba(13,148,136,0.3)] bg-[var(--primary-50)]' : 'border-[var(--background-200)]'
            } ${phase >= 0 ? 'opacity-100' : 'opacity-35'}`}>
              <Upload className={`w-4 h-4 mb-1 transition-colors duration-500 ${phase >= 0 ? 'text-[var(--primary-500)]' : 'text-[var(--text-400)]'}`} />
              <p className="font-mono text-[var(--text-400)] text-[10px] tracking-widest uppercase mb-2">Input</p>
              <div className="space-y-1">
                {['PDF', 'DOCX', 'PPTX', 'URL'].map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full transition-colors duration-500 ${phase >= 0 ? 'bg-[var(--primary-500)]' : 'bg-[var(--text-400)]'}`} />
                    <span className="text-[var(--text-700)] text-xs font-mono">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONNECTOR → ORCHESTRATOR */}
            <div className="flex items-center w-6 flex-shrink-0 relative">
              <div className="h-[2px] w-full bg-[var(--background-200)] relative">
                <div className={`absolute inset-0 bg-[var(--primary-500)] origin-left ${phase >= 1 ? 'scale-x-100' : 'scale-x-0'}`} style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                {phase === 0 && <div className="absolute w-2 h-2 bg-[var(--primary-500)] rounded-full shadow-[0_0_8px_var(--primary-500)] animate-packet-travel" style={{ top: '-3px' }} />}
              </div>
            </div>

            {/* STAGE 2: ORCHESTRATOR */}
            <div className={`arch-stage flex-1 border p-3 transition-all duration-500 ${
              phase === 1 ? 'border-[var(--primary-500)] shadow-[0_0_15px_rgba(13,148,136,0.3)]' : 'border-[var(--background-200)]'
            } ${phase >= 1 ? 'opacity-100' : 'opacity-35'}`}>
              <Zap className={`w-4 h-4 mb-1 transition-colors duration-500 ${phase >= 1 ? 'text-[var(--primary-500)]' : 'text-[var(--text-400)]'}`} />
              <p className="font-mono text-[var(--text-400)] text-[10px] tracking-widest uppercase mb-2">Orchestrator</p>
              <div className="bg-gradient-to-r from-[var(--primary-400)] to-[var(--primary-500)] px-2 py-1.5 mb-1.5">
                <p className="text-white font-bold text-xs">LangGraph</p>
              </div>
              <p className="text-[var(--text-600)] text-[10px] italic">
                {phase === 1 ? t('Decomposing tasks...', 'タスク分解中...') : t('Task routing engine', 'タスクルーティングエンジン')}
              </p>
              {phase === 1 && (
                <div className="flex gap-1 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-500)] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-500)] animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-500)] animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>

            {/* CONNECTOR → FAN-OUT to AGENTS */}
            <div className="flex items-center w-6 flex-shrink-0 relative">
              <div className="h-[2px] w-full bg-[var(--background-200)] relative">
                <div className={`absolute inset-0 bg-[var(--primary-500)] origin-left ${phase >= 2 ? 'scale-x-100' : 'scale-x-0'}`} style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                {phase === 1 && <div className="absolute w-2 h-2 bg-[var(--primary-500)] rounded-full shadow-[0_0_8px_var(--primary-500)] animate-packet-travel" style={{ top: '-3px' }} />}
              </div>
            </div>

            {/* STAGE 3: PARALLEL AGENTS */}
            <div className={`flex-[1.5] grid grid-cols-2 gap-1.5 transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-35'}`}>
              {agents.map((agent, i) => (
                <div key={i} className={`border p-2 text-center transition-all duration-500 ${
                  phase === 2
                    ? 'border-current shadow-[0_0_12px_rgba(13,148,136,0.2)]'
                    : 'border-[var(--background-200)]'
                }`} style={{ borderColor: phase === 2 ? agent.color : undefined }}>
                  <agent.icon className="w-4 h-4 mx-auto" style={{ color: agent.color }} />
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: agent.color }}>{agent.name}</p>
                  {phase === 2 && (
                    <div className="mt-1 h-1 bg-[var(--background-200)] rounded overflow-hidden">
                      <div className="h-full rounded animate-pulse" style={{ width: `${60 + i * 10}%`, background: agent.color }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CONNECTOR → FAN-IN to RENDERER */}
            <div className="flex items-center w-6 flex-shrink-0 relative">
              <div className="h-[2px] w-full bg-[var(--background-200)] relative">
                <div className={`absolute inset-0 bg-[var(--primary-500)] origin-left ${phase >= 3 ? 'scale-x-100' : 'scale-x-0'}`} style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                {phase === 2 && <div className="absolute w-2 h-2 bg-[var(--primary-500)] rounded-full shadow-[0_0_8px_var(--primary-500)] animate-packet-travel" style={{ top: '-3px' }} />}
              </div>
            </div>

            {/* STAGE 4: RENDERER */}
            <div className={`arch-stage flex-1 border p-3 transition-all duration-500 ${
              phase === 3 ? 'border-[var(--primary-500)] shadow-[0_0_15px_rgba(13,148,136,0.3)]' : 'border-[var(--background-200)]'
            } ${phase >= 3 ? 'opacity-100' : 'opacity-35'}`}>
              <Cpu className={`w-4 h-4 mb-1 transition-colors duration-500 ${phase >= 3 ? 'text-[var(--primary-500)]' : 'text-[var(--text-400)]'}`} />
              <p className="font-mono text-[var(--text-400)] text-[10px] tracking-widest uppercase mb-2">Renderer</p>
              <p className="text-[var(--text-950)] font-bold text-xs mb-0.5">{t('Canvas Engine', 'キャンバスエンジン')}</p>
              <p className="text-[var(--text-600)] text-[10px]">WebSocket streaming</p>
              {phase === 3 && (
                <div className="mt-1.5 h-1.5 bg-[var(--background-200)] rounded overflow-hidden">
                  <div className="h-full bg-[var(--primary-500)] rounded animate-pulse" style={{ width: '70%' }} />
                </div>
              )}
            </div>

            {/* CONNECTOR → OUTPUT */}
            <div className="flex items-center w-6 flex-shrink-0 relative">
              <div className="h-[2px] w-full bg-[var(--background-200)] relative">
                <div className={`absolute inset-0 bg-[var(--primary-500)] origin-left ${phase >= 4 ? 'scale-x-100' : 'scale-x-0'}`} style={{ transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                {phase === 3 && <div className="absolute w-2 h-2 bg-[var(--primary-500)] rounded-full shadow-[0_0_8px_var(--primary-500)] animate-packet-travel" style={{ top: '-3px' }} />}
              </div>
            </div>

            {/* STAGE 5: OUTPUT */}
            <div className={`arch-stage flex-[0.8] border p-3 rounded-r transition-all duration-500 ${
              phase === 4 ? 'border-[var(--primary-500)] shadow-[0_0_15px_rgba(13,148,136,0.3)]' : 'border-[var(--background-200)]'
            } ${phase >= 4 ? 'opacity-100' : 'opacity-35'}`}>
              <Download className={`w-4 h-4 mb-1 transition-colors duration-500 ${phase >= 4 ? 'text-[var(--primary-500)]' : 'text-[var(--text-400)]'}`} />
              <p className="font-mono text-[var(--text-400)] text-[10px] tracking-widest uppercase mb-2">Output</p>
              <div className="space-y-1.5">
                {['Canvas', 'PPTX'].map((t, i) => (
                  <div key={i} className={`px-2 py-1 text-[10px] font-mono text-center transition-all duration-500 ${
                    phase >= 4 ? 'bg-[var(--primary-500)] text-white' : 'bg-[var(--background-100)] text-[var(--text-500)]'
                  }`}>{t}</div>
                ))}
              </div>
              {phase >= 4 && <p className="text-[var(--primary-500)] text-xs font-bold mt-1.5 text-center">&#10003;</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Point & Edit loop indicator */}
      <div className={`flex items-center gap-3 mb-5 transition-opacity duration-500 ${phase === 5 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary-500)] to-transparent" />
        <div className="flex items-center gap-2 px-4 py-1.5 border border-[var(--primary-300)] bg-[var(--primary-100)]/20 rounded-full">
          <span className="text-[var(--primary-500)] text-sm">&#8617;</span>
          <span className="text-[var(--primary-500)] text-xs font-medium">Point & Edit: Routes to the right agent</span>
        </div>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary-500)] to-transparent" />
      </div>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-6 pt-4 border-t border-[var(--background-200)]">
        {[
          { label: 'FRONTEND', tech: 'React + TypeScript' },
          { label: 'CANVAS', tech: 'Fabric.js' },
          { label: 'BACKEND', tech: 'FastAPI (Python)' },
          { label: 'AI ENGINE', tech: 'Gemini API (Honda GCP)' },
          { label: 'ORCHESTRATION', tech: 'LangGraph' },
          { label: 'DEPLOYMENT', tech: 'GCP (Honda Tenant)' },
        ].map((s, i) => (
          <div key={i} className="reveal flex-1 min-w-[120px]" style={stagger(i + 3)}>
            <p className="font-mono text-[var(--text-400)] text-[10px] tracking-widest">{s.label}</p>
            <p className="text-[var(--text-800)] text-sm mt-1">{s.tech}</p>
          </div>
        ))}
      </div>

      {/* Aria live region for phase announcements */}
      <div aria-live="polite" className="sr-only">
        {phase >= 0 && phaseLabels[phase]}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 10 — Data & Security
   ═══════════════════════════════════════════════ */
const Section10 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Data and Security"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('13 — DATA', '13 — データ')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Input Sources */}
        <div>
          <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-6" style={stagger(1)}>{t('Input Sources', '入力ソース')}</h2>
          <div className="space-y-4">
            {[
              { title: t('User Uploads', 'ユーザーアップロード'), desc: 'PDF, DOCX, PPTX, TXT, CSV, Excel' },
              { title: t('Teams Transcripts', 'Teams議事録'), desc: t('Meeting recordings via Graph API', 'Graph APIを経由した会議録音') },
              { title: t('Web URLs', 'Web URL'), desc: t('Articles, documentation pages', '記事・ドキュメントページ') },
              { title: t('Honda Templates', 'Hondaテンプレート'), desc: t('Pre-loaded TFT corporate design', 'TFTコーポレートデザインをプリロード') },
            ].map((item, i) => (
              <div key={i} className="reveal border-l-2 border-[var(--primary-400)] pl-6" style={stagger(i + 2)}>
                <p className="text-[var(--text-950)] font-semibold text-xl">{item.title}</p>
                <p className="text-[var(--text-600)] text-base mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div>
          <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-6" style={stagger(1)}>{t('Data Security', 'データセキュリティ')}</h2>
          <div className="space-y-4">
            {[
              { title: t('Cloud Deployment', 'クラウドデプロイ'), desc: t('Runs on GCP or Azure (Honda tenant)', 'GCPまたはAzure（Hondaテナント）上で稼働') },
              { title: t('Enterprise AI APIs', 'エンタープライズAI API'), desc: 'Gemini API / Azure OpenAI' },
              { title: t('Honda Tenant Only', 'Hondaテナント限定'), desc: t('All processing stays within Honda cloud', '全処理がHondaクラウド内で完結') },
              { title: t('Session-Based Storage', 'セッションベースストレージ'), desc: t('No persistent file storage', '永続的なファイル保存なし') },
            ].map((item, i) => (
              <div key={i} className="reveal border-l-2 border-[var(--secondary-400)] pl-6" style={stagger(i + 6)}>
                <p className="text-[var(--text-950)] font-semibold text-xl">{item.title}</p>
                <p className="text-[var(--text-600)] text-base mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="reveal mt-6 pt-5 border-t border-[var(--background-200)]" style={stagger(10)}>
        <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-3">{t('Compliance Ready', 'コンプライアンス対応')}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'EU AI Act', desc: t('Limited Risk classification, transparency labels available', '限定リスク分類、透明性ラベル対応') },
            { label: 'GDPR', desc: t('Session-based processing, no persistent data retention', 'セッションベース処理、永続的データ保持なし') },
            { label: t('Honda Policy', 'Honda規定'), desc: t('No external training on Honda data, audit logging', 'Hondaデータの外部学習禁止、監査ログ') },
            { label: 'ISO 27001', desc: t('Deployable in certified cloud environments', '認証クラウド環境にデプロイ可能') },
          ].map((item, i) => (
            <div key={i} className="reveal border-l-2 border-[var(--primary-400)] pl-3" style={stagger(i + 11)}>
              <p className="text-[var(--text-950)] font-semibold text-sm">{item.label}</p>
              <p className="text-[var(--text-600)] text-xs mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 11 — Timeline
   ═══════════════════════════════════════════════ */
const Section11 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Timeline"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('16 — TIMELINE', '16 — タイムライン')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-8" style={stagger(1)}>{t('Timeline & Status', 'タイムライン＆ステータス')}</h2>

      {/* Month headers */}
      <div className="reveal flex gap-1 mb-6 pl-44" style={stagger(2)}>
        {['Mar', 'Apr', 'May', 'Jun'].map(m => (
          <div key={m} className="flex-1 text-center font-mono text-[var(--text-500)] text-sm">{m}</div>
        ))}
      </div>

      {/* Gantt rows */}
      <div className="space-y-3 mb-8">
        {[
          { name: 'Phase 1: MVP', color: 'bg-[var(--primary-500)]', start: 0, width: 25 },
          { name: 'Phase 2: Agentic UX', color: 'bg-[var(--primary-400)]', start: 20, width: 17 },
          { name: 'Phase 3: Translate', color: 'bg-amber-500', start: 33, width: 25 },
          { name: '+2wk Buffer', color: 'bg-amber-500/40', start: 58, width: 5 },
          { name: 'Phase 4: Point & Edit', color: 'bg-[var(--primary-600)]', start: 53, width: 17 },
          { name: 'Phase 5: Templates', color: 'bg-[var(--text-500)]', start: 67, width: 17 },
          { name: 'Phase 6: Pilot', color: 'bg-[var(--secondary-400)]', start: 80, width: 17 },
        ].map((phase, i) => (
          <div key={i} className="reveal flex items-center gap-4" style={stagger(i + 3)}>
            <div className="w-40 text-right flex-shrink-0">
              <p className="text-[var(--text-800)] text-sm font-medium truncate">{phase.name}</p>
            </div>
            <div className="flex-1 relative h-8 bg-[var(--background-100)]">
              <div
                className={`gantt-bar absolute h-full ${phase.color}`}
                style={{ left: `${phase.start}%`, width: `${phase.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="flex flex-wrap gap-8 pt-5 border-t border-[var(--background-200)]">
        {[
          { status: t('COMPLETED', '完了'), title: t('Translation Prototype', '翻訳プロトタイプ'), desc: t('Layout preservation working', 'レイアウト保持が動作中'), color: 'text-[var(--primary-500)]' },
          { status: t('IN PROGRESS', '進行中'), title: t('PRD & Architecture', 'PRD＆アーキテクチャ'), desc: t('Defining system design', 'システム設計を策定中'), color: 'text-[var(--warning)]' },
          { status: t('NEXT', '次'), title: t('Generate Mode MVP', '生成モードMVP'), desc: t('Starting March 2026', '2026年3月開始'), color: 'text-[var(--text-500)]' },
        ].map((s, i) => (
          <div key={i} className="reveal flex-1 min-w-[200px] border-l-2 border-[var(--background-200)] pl-5" style={stagger(i + 9)}>
            <p className={`font-mono text-xs tracking-widest ${s.color}`}>{s.status}</p>
            <p className="text-[var(--text-950)] font-semibold text-lg mt-2">{s.title}</p>
            <p className="text-[var(--text-500)] text-base mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Success checkpoints */}
      <div className="reveal mt-4 pt-4 border-t border-[var(--background-200)]" style={stagger(12)}>
        <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-2">{t('Success Checkpoints', '成功チェックポイント')}</p>
        <div className="flex flex-wrap gap-6 text-sm">
          <span className="text-[var(--text-700)]"><span className="text-[var(--primary-500)] font-semibold">{t('Phase 1:', 'Phase 1：')}</span> {t('Internal demo to stakeholders', 'ステークホルダーへの社内デモ')}</span>
          <span className="text-[var(--text-700)]"><span className="text-[var(--warning)] font-semibold">{t('Phase 3:', 'Phase 3：')}</span> {t('Translation accuracy > 90%', '翻訳精度 > 90%')}</span>
          <span className="text-[var(--text-700)]"><span className="text-[var(--secondary-400)] font-semibold">{t('Phase 6:', 'Phase 6：')}</span> {t('Pilot metrics meet targets', 'パイロット指標が目標達成')}</span>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION 12 — Thank You
   ═══════════════════════════════════════════════ */
const Section12 = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center items-center px-8 relative"
      aria-label="Thank You"
    >
      <h1 className="reveal text-7xl md:text-8xl font-bold tracking-tight mb-4" style={stagger(0)}>
        <span className="text-[var(--primary-500)]">Slide</span>
        <span className="text-[var(--text-950)]">Link</span>
      </h1>
      <div className="reveal reveal-line h-[2px] bg-[var(--primary-500)] my-8" style={stagger(1)} />
      <p className="reveal text-[var(--text-800)] text-2xl md:text-3xl mb-4 tracking-wide text-center" style={stagger(2)}>
        Three Worlds. One Platform. Zero Data Leakage.
      </p>
      <p className="reveal text-[var(--text-700)] text-lg md:text-xl max-w-xl text-center leading-relaxed" style={stagger(3)}>
        NotebookLM Quality &bull; Genspark Interaction &bull; Canva Editing
      </p>
      <p className="reveal text-[var(--text-500)] text-base mt-2 mb-12" style={stagger(4)}>
        All on Honda's GCP with your Gemini API
      </p>

      <div className="reveal absolute bottom-16 text-center" style={stagger(5)}>
        <p className="text-[var(--text-400)] font-mono text-sm">{t('Advanced AI Strategy Planning Division', '先進AI戦略企画部')}</p>
        <p className="text-[var(--text-700)] text-lg mt-3">{t('Questions & Discussion', 'ご質問・ディスカッション')}</p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION — Demo (Genspark Chat + Canva Canvas)
   Left: Chat panel | Right: Toolbar + Canvas + Thumbnails + Properties
   ═══════════════════════════════════════════════ */
const SectionDemo = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Demo"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('05 — INTERFACE', '05 — インターフェース')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-2" style={stagger(1)}>{t('Product Interface', 'プロダクトインターフェース')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-6" style={stagger(2)}>{t('Genspark-style chat + Canva-style canvas', 'Genspark風チャット + Canva風キャンバス')}</p>

      {/* Main mockup */}
      <div className="reveal border border-[var(--background-200)] bg-[var(--background-50)] w-full max-w-6xl mx-auto shadow-lg overflow-hidden" style={stagger(3)}>

        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--background-200)] bg-[var(--background-100)]">
          <div className="flex items-center gap-3">
            <span className="text-[var(--primary-500)] font-bold text-sm">SlideLink</span>
            <span className="text-[var(--text-400)]">|</span>
            <span className="text-[var(--text-600)] text-xs">{t('FY 2025 Cost Analysis', 'FY2025 コスト分析')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-500)] border border-[var(--background-200)] px-2 py-1 rounded">{t('Share', '共有')}</span>
            <span className="text-[10px] text-white bg-[var(--primary-500)] px-2 py-1 rounded">{t('Export PPTX', 'PPTXエクスポート')}</span>
          </div>
        </div>

        {/* Two-panel layout */}
        <div className="flex h-[380px]">

          {/* LEFT: Chat Panel (Genspark-style, dark) */}
          <div className="w-[30%] bg-[#1a1a2e] flex flex-col border-r border-[#2a2a3e]">

            {/* Chat messages */}
            <div className="flex-1 p-3 space-y-3 overflow-hidden">
              {/* User message */}
              <div className="bg-[#2a2a3e] rounded-lg p-2.5">
                <p className="text-white/90 text-xs">{t('Create slides for CEO meeting about Q4 costs', 'Q4コストについてのCEO会議用スライドを作成')}</p>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-2">
                <Cpu className="w-3.5 h-3.5 text-[var(--primary-400)] flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-xs leading-relaxed">{t("I'll create a professional presentation. Coordinating the team...", 'プロフェッショナルなプレゼンを作成します。チーム調整中...')}</p>
              </div>

              {/* Agent cards */}
              <div className="bg-[#2a2a3e] rounded p-2 border-l-2 border-[var(--primary-500)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/50 text-[9px] font-mono">Using Tool</span>
                  <span className="text-[var(--primary-400)] text-[9px]">View</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3 text-[var(--info-blue)]" />
                  <span className="text-white/90 text-[11px]">{t('Analyst — Processing cost data', 'アナリスト — コストデータ処理中')}</span>
                </div>
              </div>

              <div className="bg-[#2a2a3e] rounded p-2 border-l-2 border-purple-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/50 text-[9px] font-mono">Using Tool</span>
                  <span className="text-purple-400 text-[9px]">View</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-[var(--info-purple)]" />
                  <span className="text-white/90 text-[11px]">{t('Designer — Honda template', 'デザイナー — Hondaテンプレート')}</span>
                </div>
              </div>

              {/* Chain of thought */}
              <div className="border-t border-white/10 pt-2 mt-2">
                <p className="text-white/40 text-[9px] font-mono uppercase tracking-wider mb-2">{t('Chain of Thought', '思考プロセス')}</p>
                <div className="space-y-1 text-[10px] text-white/60">
                  <p>{t('→ Found 3 cost categories...', '→ 3つのコストカテゴリを発見...')}</p>
                  <p>{t('→ Applying exec template...', '→ 役員向けテンプレートを適用中...')}</p>
                  <p>{t('→ 5-slide narrative ready', '→ 5枚のスライド構成完了')}</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2 mb-2">
                <span className="text-[9px] font-medium text-white bg-[var(--primary-600)] px-2 py-0.5 rounded">Professional</span>
                <span className="text-[9px] font-medium text-white/40 px-2 py-0.5">Creative</span>
              </div>
              <div className="bg-[#2a2a3e] rounded px-3 py-2 text-white/30 text-xs flex items-center justify-between">
                <span>{t('Type message...', 'メッセージを入力...')}</span>
                <span className="text-white/50">&rarr;</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Canvas Area (Canva-style, light) */}
          <div className="w-[70%] flex flex-col bg-[#f5f5f5]">

            {/* Toolbar (top) - Canva style */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-[var(--background-200)]">
              <span className="text-[10px] text-[var(--text-600)] border border-[var(--background-200)] px-2 py-1 rounded flex items-center gap-1">{t('Edit', '編集')}</span>
              <span className="text-[10px] text-[var(--text-600)] border border-[var(--background-200)] px-2 py-1 rounded flex items-center gap-1">{t('BG Remover', '背景除去')}</span>
              <div className="w-4 h-4 rounded-full bg-[#CC0000] border border-[var(--background-200)]" />
              <span className="text-[10px] text-[var(--text-600)] border border-[var(--background-200)] px-2 py-1 rounded">{t('Crop', '切り抜き')}</span>
              <span className="text-[10px] text-[var(--text-600)] border border-[var(--background-200)] px-2 py-1 rounded">{t('Flip', '反転')}</span>
              <span className="text-[10px] text-[var(--text-600)] border border-[var(--background-200)] px-2 py-1 rounded">{t('Animate', 'アニメ')}</span>
              <span className="text-[10px] text-[var(--text-600)] border border-[var(--background-200)] px-2 py-1 rounded">{t('Position', '配置')}</span>
            </div>

            {/* Main canvas */}
            <div className="flex-1 p-4 flex items-center justify-center">
              <div className="bg-white border border-[var(--background-200)] shadow-sm w-full max-w-md aspect-video relative p-4">
                {/* Honda logo */}
                <div className="w-12 h-3 bg-[#CC0000] rounded-sm mb-3" />

                {/* Selected element with handles */}
                <div className="relative inline-block">
                  <div className="border-2 border-[var(--primary-500)] px-3 py-2 bg-[var(--primary-50)]/50">
                    <p className="text-[var(--text-950)] font-bold text-sm">FY 2025</p>
                    <p className="text-[var(--text-600)] text-xs">{t('Cost Analysis', 'コスト分析')}</p>
                  </div>
                  {/* Resize handles */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-[var(--primary-500)] border border-white" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--primary-500)] border border-white" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[var(--primary-500)] border border-white" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[var(--primary-500)] border border-white" />
                </div>

                {/* Floating action bar (Canva-style) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-8 bg-[#1a1a2e] rounded-lg px-2 py-1 flex items-center gap-2 shadow-lg">
                  <span className="text-white/80 text-[10px]">{t('Ask AI', 'AIに質問')}</span>
                  <span className="text-white/40">|</span>
                  <span className="text-white/60 text-[10px] font-mono">{t('Redo', 'やり直し')}</span>
                  <span className="text-white/60 text-[10px] font-mono">{t('Copy', 'コピー')}</span>
                  <span className="text-white/60 text-[10px] font-mono">{t('Del', '削除')}</span>
                </div>

                {/* Chart placeholder */}
                <div className="absolute bottom-3 right-3 w-16 h-10 border border-[var(--background-200)] rounded flex items-center justify-center bg-white">
                  <div className="flex items-end gap-0.5 h-6">
                    <div className="w-2 h-3 bg-[var(--primary-400)]" />
                    <div className="w-2 h-5 bg-[var(--primary-500)]" />
                    <div className="w-2 h-4 bg-[var(--primary-400)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Slide thumbnails (bottom) - Canva style */}
            <div className="px-3 py-2 bg-white border-t border-[var(--background-200)]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-400)] text-[10px]">{t('Notes', 'ノート')}</span>
                <span className="text-[var(--text-400)] text-[10px]">{t('Timer', 'タイマー')}</span>
                <div className="flex-1" />
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className={`w-10 h-6 rounded border ${n === 3 ? 'border-[var(--primary-500)] ring-1 ring-[var(--primary-500)]' : 'border-[var(--background-200)]'} bg-white flex items-center justify-center`}>
                      <span className={`text-[8px] ${n === 3 ? 'text-[var(--primary-500)]' : 'text-[var(--text-400)]'}`}>{n}</span>
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded border border-dashed border-[var(--background-300)] flex items-center justify-center text-[var(--text-400)] text-xs">+</div>
                </div>
                <span className="text-[var(--text-400)] text-[10px] ml-2">3 / 6</span>
              </div>
            </div>

            {/* Properties panel (very bottom) - context-aware */}
            <div className="px-3 py-2 bg-[var(--background-100)] border-t border-[var(--background-200)]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-500)] text-[9px]">{t('Font', 'フォント')}</span>
                  <span className="text-[var(--text-800)] text-[10px] border border-[var(--background-200)] bg-white px-2 py-0.5 rounded">Honda Head</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-500)] text-[9px]">{t('Size', 'サイズ')}</span>
                  <span className="text-[var(--text-800)] text-[10px] border border-[var(--background-200)] bg-white px-2 py-0.5 rounded">48</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-5 h-5 border border-[var(--background-200)] bg-white rounded flex items-center justify-center text-[var(--text-600)] text-[10px] font-bold">B</span>
                  <span className="w-5 h-5 border border-[var(--background-200)] bg-white rounded flex items-center justify-center text-[var(--text-600)] text-[10px] italic">I</span>
                  <span className="w-5 h-5 border border-[var(--background-200)] bg-white rounded flex items-center justify-center text-[var(--text-600)] text-[10px] underline">U</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-500)] text-[9px]">{t('Color', '色')}</span>
                  <div className="w-5 h-5 rounded bg-[#CC0000] border border-[var(--background-200)]" />
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-500)] text-[9px]">X</span>
                  <span className="text-[var(--text-800)] text-[10px] border border-[var(--background-200)] bg-white px-1 py-0.5 rounded w-10 text-center">100</span>
                  <span className="text-[var(--text-500)] text-[9px]">Y</span>
                  <span className="text-[var(--text-800)] text-[10px] border border-[var(--background-200)] bg-white px-1 py-0.5 rounded w-10 text-center">200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="reveal text-[var(--text-600)] text-base text-center mt-5 max-w-2xl mx-auto" style={stagger(4)}>
        {t(
          <><span className="text-[var(--primary-500)] font-semibold">Left:</span> Chat with AI agents (Genspark-style) &bull; <span className="text-[var(--primary-500)] font-semibold ml-2">Right:</span> Direct canvas editing (Canva-style)</>,
          <><span className="text-[var(--primary-500)] font-semibold">左：</span> AIエージェントとチャット（Genspark風）&bull; <span className="text-[var(--primary-500)] font-semibold ml-2">右：</span> ダイレクトキャンバス編集（Canva風）</>
        )}
      </p>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION — Two Ways to Edit
   Chat-based (Genspark) vs Direct (Canva)
   ═══════════════════════════════════════════════ */
const SectionPointEdit = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Two Ways to Edit"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('06 — EDITING', '06 — 編集')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Two Ways to Edit', '2つの編集方法')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('Choose your workflow — or use both together', 'ワークフローを選択 — 両方を組み合わせることも可能')}</p>

      {/* Two-column comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

        {/* Chat-based editing (Genspark-style) */}
        <div className="reveal" style={stagger(3)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 flex items-center justify-center bg-[#1a1a2e] rounded-lg">
              <Cpu className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-950)]">{t('Chat-Based Editing', 'チャットベース編集')}</h3>
              <p className="text-[var(--text-500)] text-sm">{t('Genspark-style interaction', 'Genspark風インタラクション')}</p>
            </div>
          </div>

          <div className="border border-[var(--background-200)] bg-[#1a1a2e] rounded-lg p-4 h-48">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Search className="w-3 h-3" />
                <span>{t('Selected: Bar Chart (Q4 Costs)', '選択中：棒グラフ（Q4コスト）')}</span>
              </div>
              <div className="bg-[#2a2a3e] rounded p-2">
                <p className="text-white/80 text-xs italic mb-2">{t('"What would you like to change?"', '「何を変更しますか？」')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {[t('Change type', 'タイプ変更'), t('Restyle', 'スタイル変更'), t('Add data', 'データ追加')].map((a, i) => (
                    <span key={i} className="text-[10px] border border-[var(--primary-400)] text-[var(--primary-400)] px-2 py-0.5 rounded">{a}</span>
                  ))}
                </div>
              </div>
              <div className="bg-[var(--primary-600)] rounded px-3 py-2">
                <p className="text-white text-xs">{t('"Show as pie chart with percentages"', '「円グラフにパーセンテージ付きで表示」')}</p>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-[var(--info-blue)]" />
                <span className="text-white/80 text-xs">{t('Analyst processing...', 'アナリスト処理中...')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[var(--text-700)] text-sm"><span className="text-[var(--primary-500)] font-semibold">{t('Best for:', '最適な用途：')}</span> {t('Complex changes', '複雑な変更')}</p>
            <p className="text-[var(--text-600)] text-sm">&bull; {t('Data updates & chart transformations', 'データ更新・チャート変換')}</p>
            <p className="text-[var(--text-600)] text-sm">&bull; {t('Content rewrites & additions', 'コンテンツの書き換え・追加')}</p>
            <p className="text-[var(--text-600)] text-sm">&bull; {t('Multi-element operations', '複数要素の一括操作')}</p>
          </div>
        </div>

        {/* Direct manipulation (Canva-style) */}
        <div className="reveal" style={stagger(4)}>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 flex items-center justify-center bg-[var(--primary-100)] rounded-lg">
              <Palette className="w-5 h-5 text-[var(--primary-600)]" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-950)]">{t('Direct Manipulation', 'ダイレクト操作')}</h3>
              <p className="text-[var(--text-500)] text-sm">{t('Canva-style editing', 'Canva風編集')}</p>
            </div>
          </div>

          <div className="border border-[var(--background-200)] bg-white rounded-lg p-4 h-48 relative">
            {/* Element with selection handles */}
            <div className="absolute top-6 left-6">
              <div className="relative">
                <div className="border-2 border-[var(--primary-500)] p-3 bg-[var(--primary-50)]">
                  <p className="text-[var(--text-950)] font-bold">{t('Q4 Costs', 'Q4コスト')}</p>
                </div>
                {/* Handles */}
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[var(--primary-500)] border border-white cursor-nw-resize" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--primary-500)] border border-white cursor-ne-resize" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[var(--primary-500)] border border-white cursor-sw-resize" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[var(--primary-500)] border border-white cursor-se-resize" />
                {/* Move indicator */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-[var(--primary-500)] font-mono whitespace-nowrap">
                  {t(<>&harr; Drag to move</>, <>&harr; ドラッグで移動</>)}
                </div>
              </div>
            </div>

            {/* Properties mini-panel */}
            <div className="absolute bottom-4 right-4 bg-[var(--background-100)] border border-[var(--background-200)] rounded p-2 shadow-sm">
              <p className="text-[9px] text-[var(--text-400)] font-mono mb-1">{t('Properties', 'プロパティ')}</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-[var(--text-600)]">{t('Size:', 'サイズ：')}</span>
                <span className="w-8 text-[10px] border border-[var(--background-200)] rounded px-1 py-0.5 text-center bg-white">24</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-[#CC0000] rounded border" />
                <div className="w-4 h-4 bg-[var(--primary-500)] rounded border" />
                <div className="w-4 h-4 bg-[var(--text-800)] rounded border" />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-[var(--text-700)] text-sm"><span className="text-[var(--primary-500)] font-semibold">{t('Best for:', '最適な用途：')}</span> {t('Quick tweaks', '簡単な微調整')}</p>
            <p className="text-[var(--text-600)] text-sm">&bull; {t('Repositioning & resizing', '位置変更・リサイズ')}</p>
            <p className="text-[var(--text-600)] text-sm">&bull; {t('Color & font changes', '色・フォント変更')}</p>
            <p className="text-[var(--text-600)] text-sm">&bull; {t('Fine-tuning alignment', '配置の微調整')}</p>
          </div>
        </div>
      </div>

      {/* Key differentiator */}
      <div className="reveal border-t border-[var(--background-200)] pt-6" style={stagger(5)}>
        <div className="grid grid-cols-3 gap-6 max-w-3xl">
          <div className="border-l-2 border-[var(--danger)] pl-4">
            <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-1">NotebookLM</p>
            <p className="text-[var(--danger)] text-sm font-medium">{t("Screenshot — Can't edit at all", 'スクリーンショット — 編集不可')}</p>
          </div>
          <div className="border-l-2 border-[var(--warning)] pl-4">
            <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-1">{t('Others', 'その他')}</p>
            <p className="text-[var(--warning)] text-sm font-medium">{t('Chat only OR canvas only', 'チャットのみ、またはキャンバスのみ')}</p>
          </div>
          <div className="border-l-2 border-[var(--primary-500)] pl-4">
            <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-1">SlideLink</p>
            <p className="text-[var(--primary-500)] text-sm font-medium">{t('Both — your choice', '両方 — 選択可能')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION — ROI Calculator
   Business impact and quantified savings
   ═══════════════════════════════════════════════ */
const SectionROI = () => {
  const ref = useScrollReveal();
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="ROI Calculator"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>11 — BUSINESS IMPACT</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>Business Impact</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>Quantified savings for Honda</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        {/* Time Savings */}
        <div className="reveal border border-[var(--background-200)] p-5" style={stagger(3)}>
          <p className="font-mono text-[var(--primary-500)] text-xs tracking-widest uppercase mb-4">Annual Time Savings per User</p>
          <div className="space-y-2 text-base">
            <div className="flex justify-between border-b border-[var(--background-100)] pb-2">
              <span className="text-[var(--text-700)]">Hours per presentation</span>
              <span className="font-mono"><span className="text-[var(--danger-muted)] line-through mr-2">6h</span><span className="text-[var(--primary-500)] font-bold">0.5h</span></span>
            </div>
            <div className="flex justify-between border-b border-[var(--background-100)] pb-2">
              <span className="text-[var(--text-700)]">Presentations per year</span>
              <span className="text-[var(--text-800)] font-mono font-medium">50</span>
            </div>
            <div className="flex justify-between border-b border-[var(--background-100)] pb-2">
              <span className="text-[var(--text-700)]">Hours saved per user</span>
              <span className="text-[var(--primary-500)] font-mono font-bold">275 hrs/yr</span>
            </div>
            <div className="flex justify-between border-b border-[var(--background-100)] pb-2">
              <span className="text-[var(--text-700)]">Cost per hour (loaded)</span>
              <span className="text-[var(--text-800)] font-mono">¥8,000</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--primary-300)]">
            <p className="text-[var(--text-500)] text-sm">Savings per user</p>
            <p className="text-[var(--accent-500)] text-3xl font-bold font-mono">¥2,200,000<span className="text-base font-normal text-[var(--text-500)]">/year</span></p>
          </div>
        </div>

        {/* Business Trip Savings */}
        <div className="reveal border border-[var(--background-200)] p-5" style={stagger(4)}>
          <p className="font-mono text-[var(--primary-500)] text-xs tracking-widest uppercase mb-4">Business Trip Travel Reduction</p>
          <div className="space-y-2 text-base">
            <div className="flex justify-between border-b border-[var(--background-100)] pb-2">
              <span className="text-[var(--text-700)]">People per trip</span>
              <span className="font-mono"><span className="text-[var(--danger-muted)] line-through mr-2">3</span><span className="text-[var(--primary-500)] font-bold">1</span> <span className="text-[var(--text-500)] text-sm">(66% cut)</span></span>
            </div>
            <div className="flex justify-between border-b border-[var(--background-100)] pb-2">
              <span className="text-[var(--text-700)]">Travel cost per person</span>
              <span className="text-[var(--text-800)] font-mono">¥300,000</span>
            </div>
            <div className="flex justify-between border-b border-[var(--background-100)] pb-2">
              <span className="text-[var(--text-700)]">Business trips per year</span>
              <span className="text-[var(--text-800)] font-mono font-medium">10</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--primary-300)]">
            <p className="text-[var(--text-500)] text-sm">Travel savings per year</p>
            <p className="text-[var(--accent-500)] text-3xl font-bold font-mono">¥6,000,000<span className="text-base font-normal text-[var(--text-500)]">/year</span></p>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="reveal bg-[var(--primary-500)] p-5" style={stagger(5)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm">50 users × ¥2.2M + ¥6M travel</p>
            <p className="text-white text-2xl md:text-3xl font-bold font-mono mt-1">Total: ~¥116,000,000<span className="text-base font-normal">/year</span></p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">Estimated payback</p>
            <p className="text-white text-2xl font-bold">&lt; 3 months</p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION — Risks & Mitigation
   ═══════════════════════════════════════════════ */
const SectionRisks = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Risks and Mitigation"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('14 — RISKS', '14 — リスク')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Risk Management', 'リスク管理')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('Proactive mitigation strategies', 'プロアクティブな軽減策')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { risk: t('AI Hallucination', 'AIハルシネーション'), impact: t('High', '高'), mitigation: t('Confidence scores + mandatory human review before export', '信頼度スコア＋エクスポート前の必須人間レビュー'), color: 'border-[var(--warning)]', impactColor: 'text-[var(--danger)]' },
          { risk: t('User Adoption', 'ユーザー導入'), impact: t('Medium', '中'), mitigation: t('Pilot with early adopters, iterate based on feedback', 'アーリーアダプターでパイロット、フィードバックに基づき改善'), color: 'border-[var(--warning)]', impactColor: 'text-[var(--warning)]' },
          { risk: t('HTML→PPTX Fidelity', 'HTML→PPTX忠実度'), impact: t('Medium', '中'), mitigation: t('Hybrid approach: native PPTX for simple elements, image export for complex visuals', 'ハイブリッドアプローチ：シンプルな要素はネイティブPPTX、複雑なビジュアルは画像エクスポート'), color: 'border-[var(--text-400)]', impactColor: 'text-[var(--warning)]' },
          { risk: t('Teams Integration Delay', 'Teams連携遅延'), impact: t('Low', '低'), mitigation: t('Launch MVP without Teams; add in Phase 2', 'Teams連携なしでMVPリリース、Phase 2で追加'), color: 'border-[var(--text-400)]', impactColor: 'text-[var(--text-500)]' },
        ].map((item, i) => (
          <div key={i} className={`reveal border-l-4 ${item.color} bg-[var(--background-100)] p-5`} style={stagger(i + 3)}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[var(--text-950)] font-bold text-lg">{item.risk}</p>
              <span className={`font-mono text-xs ${item.impactColor} tracking-widest uppercase`}>{item.impact}</span>
            </div>
            <p className="text-[var(--text-600)] text-base leading-relaxed">{item.mitigation}</p>
          </div>
        ))}
      </div>

      <p className="reveal text-[var(--text-500)] text-sm mt-6 font-mono" style={stagger(7)}>
        {t('All risks have been assessed and mitigation plans are in place.', '全リスクを評価済み、軽減計画を策定済みです。')}
      </p>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION — Success Metrics
   Pilot success criteria
   ═══════════════════════════════════════════════ */
const SectionMetrics = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Success Metrics"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('15 — METRICS', '15 — 指標')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Pilot Success Criteria', 'パイロット成功基準')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t("How we'll measure success", '成功の測定方法')}</p>

      {/* Primary metrics */}
      <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(3)}>{t('Primary Metrics', '主要指標')}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { value: '< 5 min', label: t('Time to first slide', '初回スライドまでの時間'), desc: t('From upload to generated draft', 'アップロードから生成ドラフトまで') },
          { value: '< 5 edits', label: t('Edit cycles before export', 'エクスポートまでの編集回数'), desc: t('Point & Edit iterations needed', 'Point & Editの反復回数') },
          { value: '> 4.0/5.0', label: t('User satisfaction', 'ユーザー満足度'), desc: t('Post-pilot survey score', 'パイロット後のアンケートスコア') },
        ].map((m, i) => (
          <div key={i} className="reveal border border-[var(--background-200)] p-5 text-center" style={stagger(i + 4)}>
            <p className="text-3xl md:text-4xl font-bold font-mono text-[var(--accent-500)] mb-2">{m.value}</p>
            <p className="text-[var(--text-950)] font-semibold text-base mb-1">{m.label}</p>
            <p className="text-[var(--text-500)] text-sm">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(7)}>{t('Secondary Metrics', '副次指標')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {[
          { value: '> 90%', label: t('Translation accuracy', '翻訳精度'), desc: t('Layout match vs original', 'オリジナルとのレイアウト一致度') },
          { value: '> 60%', label: t('Weekly adoption rate', '週間利用率'), desc: t('Active users among pilot group', 'パイロットグループ内のアクティブユーザー') },
        ].map((m, i) => (
          <div key={i} className="reveal border border-[var(--background-200)] p-4 flex items-center gap-5" style={stagger(i + 8)}>
            <p className="text-2xl font-bold font-mono text-[var(--primary-500)]">{m.value}</p>
            <div>
              <p className="text-[var(--text-950)] font-semibold text-base">{m.label}</p>
              <p className="text-[var(--text-500)] text-sm">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="reveal text-[var(--text-500)] text-sm font-mono pt-4 border-t border-[var(--background-200)]" style={stagger(10)}>
        {t('Metrics will be tracked via built-in analytics during 4-week pilot.', '4週間のパイロット期間中、組み込みアナリティクスで指標を追跡します。')}
      </p>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   SECTION — Next Steps / Ask
   What we need to move forward
   ═══════════════════════════════════════════════ */
const SectionNextSteps = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Next Steps"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('17 — NEXT STEPS', '17 — ネクストステップ')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Next Steps', 'ネクストステップ')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('What we need to move forward', '前進するために必要なこと')}</p>

      {/* Timeline phases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Immediate */}
        <div className="reveal" style={stagger(3)}>
          <p className="font-mono text-[var(--accent-500)] text-xs tracking-widest uppercase mb-3">{t('Immediate (This Month)', '即時（今月）')}</p>
          <div className="space-y-2 border-l-2 border-[var(--accent-500)] pl-4">
            <div className="flex items-center gap-2">
              <span className="text-[var(--primary-500)] text-sm">&#10003;</span>
              <span className="text-[var(--text-800)] text-sm">{t('PRD Review & Approval', 'PRDレビュー＆承認')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-[var(--text-400)]" />
              <span className="text-[var(--text-700)] text-sm">{t('Assign dev resources (1 FE, 1 BE, 0.5 AI)', '開発リソース割り当て（1 FE, 1 BE, 0.5 AI）')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-[var(--text-400)]" />
              <span className="text-[var(--text-700)] text-sm">{t('Identify 5-10 pilot users', 'パイロットユーザー5-10名を特定')}</span>
            </div>
          </div>
        </div>

        {/* Phase 1 */}
        <div className="reveal" style={stagger(4)}>
          <p className="font-mono text-[var(--primary-500)] text-xs tracking-widest uppercase mb-3">{t('Phase 1: MVP (Mar–Apr)', 'Phase 1: MVP（3月-4月）')}</p>
          <div className="space-y-2 border-l-2 border-[var(--primary-500)] pl-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-[var(--text-400)]" />
              <span className="text-[var(--text-700)] text-sm">{t('Generate mode development', '生成モード開発')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-[var(--text-400)]" />
              <span className="text-[var(--text-700)] text-sm">{t('Honda template integration', 'Hondaテンプレート統合')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-[var(--text-400)]" />
              <span className="text-[var(--text-700)] text-sm">{t('Internal testing', '社内テスト')}</span>
            </div>
          </div>
        </div>

        {/* Pilot */}
        <div className="reveal" style={stagger(5)}>
          <p className="font-mono text-[var(--warning)] text-xs tracking-widest uppercase mb-3">{t('Pilot (May–Jun)', 'パイロット（5月-6月）')}</p>
          <div className="space-y-2 border-l-2 border-[var(--warning)] pl-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-[var(--text-400)]" />
              <span className="text-[var(--text-700)] text-sm">{t('4-week pilot with selected users', '選抜ユーザーによる4週間パイロット')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-[var(--text-400)]" />
              <span className="text-[var(--text-700)] text-sm">{t('Collect feedback & metrics', 'フィードバック・指標を収集')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-[var(--text-400)]" />
              <span className="text-[var(--text-700)] text-sm">{t('Iterate based on results', '結果に基づき改善')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Ask */}
      <div className="reveal bg-[var(--primary-500)] p-6" style={stagger(6)}>
        <p className="text-white/80 font-mono text-xs tracking-widest uppercase mb-3">{t('The Ask', 'お願い')}</p>
        <div className="space-y-2">
          <p className="text-white text-base font-medium">{t('1. Approval to proceed with MVP development', '1. MVP開発への承認')}</p>
          <p className="text-white text-base font-medium">{t('2. Resource allocation: 2.5 headcount for 3.5 months', '2. リソース配分：2.5人月×3.5ヶ月')}</p>
          <p className="text-white text-base font-medium">{t('3. Pilot user nominations from each team', '3. 各チームからのパイロットユーザー推薦')}</p>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   STRATEGY SECTIONS — My PoC Journey
   Personal roadmap as an AI Product Designer
   Displayed when viewMode === 'strategy'
   ═══════════════════════════════════════════════ */

const StrategyTitle = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center items-center px-8 relative"
      aria-label="Strategy Title"
    >
      <div className="reveal reveal-line h-[2px] bg-[var(--accent-500)] mb-10" />
      <p className="reveal font-mono text-[var(--accent-500)] text-sm tracking-widest uppercase mb-4" style={stagger(1)}>
        {t('PERSONAL PoC ROADMAP', '個人PoCロードマップ')}
      </p>
      <h1 className="reveal text-6xl md:text-7xl font-bold tracking-tight mb-4" style={stagger(2)}>
        {t('Building', '構築する')}{' '}
        <span className="text-[var(--accent-500)]">SlideLink</span>
      </h1>
      <p className="reveal text-[var(--text-600)] text-xl max-w-2xl text-center mt-4 leading-relaxed" style={stagger(3)}>
        {t(
          'A solo journey from idea to working PoC — designed and built by one AI Product Designer.',
          'アイデアから動くPoCまでの一人旅 — 一人のAIプロダクトデザイナーが設計・構築。'
        )}
      </p>

      <div className="reveal grid grid-cols-3 gap-8 mt-12 max-w-3xl w-full" style={stagger(4)}>
        {[
          { num: '01', title: t('Design First', 'デザインファースト'), desc: t('UX before code — validate the experience', 'コードの前にUX — 体験を検証') },
          { num: '02', title: t('Build Smart', 'スマートに構築'), desc: t('Leverage AI tools to move fast solo', 'AIツールを活用してソロで高速に') },
          { num: '03', title: t('Ship the Core', 'コアをリリース'), desc: t('One flow, one agent, prove it works', '1フロー、1エージェント、動くことを証明') },
        ].map((p, i) => (
          <div key={i} className="reveal text-center" style={stagger(i + 5)}>
            <p className="text-4xl font-bold font-mono text-[var(--accent-500)] mb-2">{p.num}</p>
            <p className="text-[var(--text-950)] font-semibold text-lg mb-1">{p.title}</p>
            <p className="text-[var(--text-600)] text-sm">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="reveal absolute bottom-16 flex gap-6 text-[var(--text-400)] font-mono text-sm" style={stagger(8)}>
        <span>Raihan Satria</span>
        <span className="text-[var(--text-300)]">—</span>
        <span>{t('AI Product Designer', 'AIプロダクトデザイナー')}</span>
      </div>
    </section>
  );
};

const StrategyEdge = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="My Edge"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S0 — MY EDGE', 'S0 — 私の強み')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Why I Can Build This', 'なぜ私がこれを作れるのか')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('UI/UX Designer background × AI Engineer role = AI Product Designer', 'UI/UXデザイナー経験 × AIエンジニア職 = AIプロダクトデザイナー')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Skills */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(3)}>{t('Skills Profile', 'スキルプロフィール')}</p>
          <div className="space-y-3">
            {[
              { skill: t('UI/UX Design & Prototyping', 'UI/UXデザイン＆プロトタイピング'), level: 95, note: t('Figma, interaction design, user research', 'Figma、インタラクションデザイン、ユーザーリサーチ') },
              { skill: t('Frontend Development', 'フロントエンド開発'), level: 85, note: 'React, TypeScript, Tailwind, Fabric.js' },
              { skill: t('AI / LLM Engineering', 'AI / LLMエンジニアリング'), level: 80, note: t('Prompt design, function calling, agents', 'プロンプト設計、ファンクションコール、エージェント') },
              { skill: t('Backend / API', 'バックエンド / API'), level: 65, note: 'FastAPI, Python, basic infra' },
              { skill: t('PPTX Generation', 'PPTX生成'), level: 50, note: t('python-pptx — learning curve', 'python-pptx — 学習曲線あり') },
            ].map((s, i) => (
              <div key={i} className="reveal" style={stagger(i + 4)}>
                <div className="flex justify-between mb-1">
                  <p className="text-[var(--text-800)] text-sm font-medium">{s.skill}</p>
                  <span className="text-[var(--text-400)] font-mono text-xs">{s.level}%</span>
                </div>
                <div className="h-1.5 bg-[var(--background-200)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-500)] rounded-full" style={{ width: `${s.level}%` }} />
                </div>
                <p className="text-[var(--text-500)] text-xs mt-1">{s.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why this matters */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(3)}>{t('Why This Combo Works', 'なぜこの組み合わせが有効か')}</p>
          <div className="space-y-4">
            {[
              { title: t('I design the UX AND build it', 'UXを設計し、自分で構築する'), desc: t('No handoff delay. No "the design says X but the code does Y." I own both.', '引き継ぎ遅延なし。「デザインはXだがコードはY」がない。両方を自分で担当。') },
              { title: t('I understand the AI constraints', 'AIの制約を理解している'), desc: t('I design interactions that work WITH LLM limitations, not against them. No impossible features.', 'LLMの制限に逆らわず、活かすインタラクションを設計。不可能な機能は作らない。') },
              { title: t('SlideLink IS a design+AI product', 'SlideLinkはデザイン×AIプロダクト'), desc: t('A slide generator lives at the intersection of visual design and AI. That intersection is exactly where I sit.', 'スライド生成はビジュアルデザインとAIの交差点。まさに私がいる場所。') },
            ].map((item, i) => (
              <div key={i} className="reveal border-l-2 border-[var(--accent-500)] pl-5" style={stagger(i + 9)}>
                <p className="text-[var(--text-950)] font-semibold text-base">{item.title}</p>
                <p className="text-[var(--text-600)] text-sm mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const StrategyScope = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="PoC Scope"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S1 — SCOPE', 'S1 — スコープ')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('PoC Scope', 'PoCスコープ')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('Ruthless prioritization for solo execution', 'ソロ実行のための徹底的な優先順位付け')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* IN scope */}
        <div className="reveal border border-[var(--accent-500)] p-6" style={stagger(3)}>
          <p className="font-mono text-[var(--accent-500)] text-xs tracking-widest uppercase mb-4">{t('IN — PoC Must-Haves', 'IN — PoC必須項目')}</p>
          <div className="space-y-3">
            {[
              t('Upload PDF/DOCX → AI extracts content', 'PDF/DOCXアップロード → AI がコンテンツ抽出'),
              t('Single Gemini agent generates Slide JSON', '単一Geminiエージェントが Slide JSON を生成'),
              t('Fabric.js canvas with drag/drop editing', 'Fabric.jsキャンバスでドラッグ＆ドロップ編集'),
              t('Export to editable PPTX', '編集可能なPPTXにエクスポート'),
              t('One Honda template (basic)', 'Hondaテンプレート1種（基本）'),
              t('Basic chat panel for NL edits', '自然言語編集用の基本チャットパネル'),
              t('JP ↔ EN translation (text-only)', '日英翻訳（テキストのみ）'),
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[var(--accent-500)] font-bold mt-0.5">+</span>
                <p className="text-[var(--text-700)] text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* OUT of scope */}
        <div className="reveal border border-[var(--background-200)] p-6" style={stagger(4)}>
          <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4">{t('OUT — Not for PoC', 'OUT — PoCでは対象外')}</p>
          <div className="space-y-3">
            {[
              t('Multi-agent orchestration (LangGraph)', 'マルチエージェントオーケストレーション（LangGraph）'),
              t('Teams / Graph API integration', 'Teams / Graph API 連携'),
              t('Enterprise auth (SSO, RBAC)', 'エンタープライズ認証（SSO、RBAC）'),
              t('Collaboration / multi-user', 'コラボレーション / マルチユーザー'),
              t('Custom template editor', 'カスタムテンプレートエディタ'),
              t('Production deployment / CI/CD', '本番デプロイ / CI/CD'),
              t('Complex chart generation (beyond basic)', '複雑なチャート生成（基本を超えるもの）'),
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[var(--text-400)] font-bold mt-0.5">-</span>
                <p className="text-[var(--text-500)] text-sm line-through">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="reveal bg-[var(--accent-500)] p-5" style={stagger(5)}>
        <p className="text-white font-bold text-base">{t('The PoC Principle', 'PoC原則')}</p>
        <p className="text-white/80 text-sm mt-1">{t('"If one person can\'t demo it in 15 minutes, it\'s too big." — Everything above fits in one demo flow.', '「1人が15分でデモできないなら、スコープが大きすぎる」— 上記すべてが1つのデモフローに収まる。')}</p>
      </div>
    </section>
  );
};

const StrategyDesignSprint = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Phase 1: Design Sprint"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S2 — DESIGN SPRINT', 'S2 — デザインスプリント')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Phase 1: Design Before Code', 'Phase 1: コードの前にデザイン')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('Week 1-2 — My UX background is the fastest prototype tool', '1-2週目 — UXの経験が最速のプロトタイプツール')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            week: t('Day 1-3', '1-3日目'),
            title: t('User Flow & Wireframes', 'ユーザーフロー＆ワイヤーフレーム'),
            tasks: [
              t('Map the core flow: Upload → Generate → Edit → Export', 'コアフロー：アップロード → 生成 → 編集 → エクスポート'),
              t('Wireframe the chat + canvas split layout', 'チャット＋キャンバス分割レイアウトのワイヤーフレーム'),
              t('Define the Slide JSON schema on paper first', 'Slide JSONスキーマをまず紙で定義'),
            ],
          },
          {
            week: t('Day 4-7', '4-7日目'),
            title: t('Interactive Prototype', 'インタラクティブプロトタイプ'),
            tasks: [
              t('Figma prototype with realistic content', '実際のコンテンツを使ったFigmaプロトタイプ'),
              t('Simulate AI generation with pre-made slides', '事前作成スライドでAI生成をシミュレート'),
              t('Test both editing modes (chat vs canvas)', '両方の編集モードをテスト（チャット vs キャンバス）'),
            ],
          },
          {
            week: t('Day 8-10', '8-10日目'),
            title: t('Validate with Users', 'ユーザーで検証'),
            tasks: [
              t('Show prototype to 3-5 Honda colleagues', '3-5名のHonda同僚にプロトタイプを見せる'),
              t('Key question: "Would you use this?"', '重要な質問：「これを使いますか？」'),
              t('Iterate based on feedback before writing code', 'コードを書く前にフィードバックに基づき改善'),
            ],
          },
        ].map((phase, i) => (
          <div key={i} className="reveal border border-[var(--background-200)] p-5" style={stagger(i + 3)}>
            <p className="font-mono text-[var(--accent-500)] text-xs tracking-widest uppercase mb-2">{phase.week}</p>
            <p className="text-[var(--text-950)] font-bold text-lg mb-3">{phase.title}</p>
            <div className="space-y-2">
              {phase.tasks.map((task, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-500)] mt-1.5 flex-shrink-0" />
                  <p className="text-[var(--text-600)] text-sm leading-relaxed">{task}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="reveal border-l-4 border-[var(--warning)] pl-5" style={stagger(6)}>
        <p className="text-[var(--text-950)] font-semibold text-sm">{t('Go/No-Go Gate', 'Go/No-Goゲート')}</p>
        <p className="text-[var(--text-600)] text-sm mt-1">{t('If < 3 out of 5 users say "yes I\'d use this" → re-scope or pivot before investing development time.', '5人中3人未満が「使いたい」と回答 → 開発時間を投資する前にスコープ変更またはピボット。')}</p>
      </div>
    </section>
  );
};

const StrategySlideEngine = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Phase 2: Slide Engine"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S3 — SLIDE ENGINE', 'S3 — スライドエンジン')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Phase 2: The Invisible Core', 'Phase 2: 見えないコア')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-6" style={stagger(2)}>{t('Week 3-6 — AI generation + PPTX export pipeline', '3-6週目 — AI生成 + PPTXエクスポートパイプライン')}</p>

      {/* Architecture: the shared schema approach */}
      <div className="reveal mb-6" style={stagger(3)}>
        <p className="font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-3">{t('Core Architecture: Shared Slide JSON', 'コアアーキテクチャ：共有Slide JSON')}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 border border-[var(--background-200)] bg-[var(--background-100)] p-4 text-center">
            <Upload className="w-5 h-5 mx-auto mb-2 text-[var(--text-500)]" />
            <p className="text-[var(--text-950)] font-semibold text-sm">{t('Document', 'ドキュメント')}</p>
            <p className="text-[var(--text-500)] text-xs mt-1">PDF / DOCX</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--accent-500)] flex-shrink-0" />
          <div className="flex-1 border border-[var(--background-200)] bg-[var(--background-100)] p-4 text-center">
            <Cpu className="w-5 h-5 mx-auto mb-2 text-[var(--text-500)]" />
            <p className="text-[var(--text-950)] font-semibold text-sm">Gemini API</p>
            <p className="text-[var(--text-500)] text-xs mt-1">{t('Structured output', '構造化出力')}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--accent-500)] flex-shrink-0" />
          <div className="flex-[1.5] border-2 border-[var(--accent-500)] bg-[var(--accent-500)]/5 p-4 text-center">
            <p className="text-[var(--accent-500)] font-bold text-lg mb-1">Slide JSON</p>
            <p className="text-[var(--text-500)] text-xs">{t('Single source of truth', '単一の情報源')}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[var(--accent-500)] flex-shrink-0" />
              <div className="border border-[var(--background-200)] bg-[var(--background-100)] px-3 py-2 text-center">
                <p className="text-[var(--text-950)] text-xs font-semibold">Fabric.js</p>
                <p className="text-[var(--text-500)] text-[10px]">{t('Screen', '画面')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[var(--accent-500)] flex-shrink-0" />
              <div className="border border-[var(--background-200)] bg-[var(--background-100)] px-3 py-2 text-center">
                <p className="text-[var(--text-950)] text-xs font-semibold">python-pptx</p>
                <p className="text-[var(--text-500)] text-[10px]">{t('Export', 'エクスポート')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { week: t('Week 3-4', '3-4週目'), title: t('Slide JSON Schema + Gemini Prompts', 'Slide JSONスキーマ + Geminiプロンプト'), tasks: [t('Define element types: text, image, shape, chart', '要素タイプ定義：テキスト、画像、図形、チャート'), t('Prompt engineering for structured JSON output', '構造化JSON出力のプロンプトエンジニアリング'), t('Test with 5 real Honda documents', '実際のHondaドキュメント5件でテスト')] },
          { week: t('Week 5-6', '5-6週目'), title: t('PPTX Export Pipeline', 'PPTXエクスポートパイプライン'), tasks: [t('Slide JSON → python-pptx rendering', 'Slide JSON → python-pptxレンダリング'), t('Fidelity testing: does the PPTX match the canvas?', '忠実度テスト：PPTXはキャンバスと一致するか？'), t('Honda template integration (colors, fonts, logo)', 'Hondaテンプレート統合（色、フォント、ロゴ）')] },
        ].map((phase, i) => (
          <div key={i} className="reveal border-l-2 border-[var(--accent-500)] pl-5" style={stagger(i + 4)}>
            <p className="font-mono text-[var(--accent-500)] text-xs tracking-widest uppercase mb-1">{phase.week}</p>
            <p className="text-[var(--text-950)] font-semibold text-base mb-2">{phase.title}</p>
            <div className="space-y-1.5">
              {phase.tasks.map((task, j) => (
                <p key={j} className="text-[var(--text-600)] text-sm">&bull; {task}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="reveal border-l-4 border-[var(--danger)] pl-5" style={stagger(6)}>
        <p className="text-[var(--danger)] font-semibold text-sm">{t('Critical Risk: PPTX Fidelity', '重大リスク：PPTX忠実度')}</p>
        <p className="text-[var(--text-600)] text-sm mt-1">{t('If python-pptx can\'t match the canvas at 80%+ accuracy → fall back to PDF export for PoC. Don\'t let perfect PPTX block the demo.', 'python-pptxがキャンバスと80%+の精度で一致できない場合 → PoCではPDFエクスポートにフォールバック。完璧なPPTXでデモをブロックしない。')}</p>
      </div>
    </section>
  );
};

const StrategyCanvasUI = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Phase 3: Canvas UI"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S4 — CANVAS EDITOR', 'S4 — キャンバスエディタ')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Phase 3: Where My UX Shines', 'Phase 3: 私のUXが輝く場所')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('Week 7-10 — The thing users actually see and judge', '7-10週目 — ユーザーが実際に見て判断するもの')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Canvas features */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(3)}>{t('Fabric.js Canvas Features', 'Fabric.jsキャンバス機能')}</p>
          <div className="space-y-3">
            {[
              { title: t('Object Selection & Transforms', 'オブジェクト選択＆変形'), desc: t('Click to select, drag to move, handles to resize/rotate', 'クリックで選択、ドラッグで移動、ハンドルでリサイズ/回転') },
              { title: t('Properties Panel', 'プロパティパネル'), desc: t('Font, color, size, alignment — designer-grade controls', 'フォント、色、サイズ、配置 — デザイナーレベルのコントロール') },
              { title: t('Slide Thumbnails', 'スライドサムネイル'), desc: t('Left sidebar with all slides, click to navigate', '全スライドの左サイドバー、クリックでナビゲート') },
              { title: t('Real-time Preview', 'リアルタイムプレビュー'), desc: t('Every edit instantly visible on canvas', '全ての編集がキャンバス上で即座に反映') },
            ].map((item, i) => (
              <div key={i} className="reveal border-l-2 border-[var(--accent-500)] pl-4" style={stagger(i + 4)}>
                <p className="text-[var(--text-950)] font-semibold text-sm">{item.title}</p>
                <p className="text-[var(--text-600)] text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Design decisions */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(3)}>{t('UX Design Decisions', 'UXデザイン決定')}</p>
          <div className="space-y-3">
            {[
              { title: t('Canva-style, not PowerPoint-style', 'Canva風、PowerPoint風ではない'), desc: t('Clean, minimal toolbar. No ribbon menus. My design background ensures this feels modern.', 'クリーンでミニマルなツールバー。リボンメニューなし。デザインの経験がモダンな体験を保証。') },
              { title: t('Constrained elements only', '制約付き要素のみ'), desc: t('Only render what python-pptx can export. No visual lies — what you see IS what you export.', 'python-pptxがエクスポートできるもののみレンダリング。見たままがエクスポートされる。') },
              { title: t('Progressive disclosure', 'プログレッシブディスクロージャー'), desc: t('Simple mode by default. Advanced properties on demand. Don\'t overwhelm first-time users.', 'デフォルトはシンプルモード。高度なプロパティはオンデマンド。初回ユーザーを圧倒しない。') },
            ].map((item, i) => (
              <div key={i} className="reveal border border-[var(--background-200)] p-4" style={stagger(i + 8)}>
                <p className="text-[var(--text-950)] font-semibold text-sm">{item.title}</p>
                <p className="text-[var(--text-600)] text-xs mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="reveal flex items-center gap-3 pt-4 border-t border-[var(--background-200)]" style={stagger(11)}>
        <span className="w-2.5 h-2.5 bg-[var(--accent-500)] rounded-full" />
        <p className="text-[var(--text-700)] text-sm">{t('This is my strongest phase — UI/UX is where I move 3x faster than a typical backend engineer.', 'これが私の最も得意なフェーズ — UI/UXでは一般的なバックエンドエンジニアの3倍速く動ける。')}</p>
      </div>
    </section>
  );
};

const StrategyAIChat = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Phase 4: AI Chat & Translation"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S5 — AI INTEGRATION', 'S5 — AI統合')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Phase 4: Chat + Translation', 'Phase 4: チャット + 翻訳')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('Week 11-14 — Connect the AI brain to the visual body', '11-14週目 — AI脳をビジュアルに接続')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Chat panel */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(3)}>{t('Chat Editing', 'チャット編集')}</p>
          <div className="space-y-3">
            {[
              { cmd: t('"Make the title bigger"', '「タイトルを大きくして」'), flow: t('Parse intent → find title element in JSON → update fontSize → canvas re-renders', '意図を解析 → JSONのタイトル要素を検索 → fontSizeを更新 → キャンバス再レンダリング') },
              { cmd: t('"Change the chart to a pie chart"', '「チャートを円グラフに変更して」'), flow: t('Parse intent → modify chart type in JSON → re-render chart element', '意図を解析 → JSONのチャートタイプを変更 → チャート要素を再レンダリング') },
              { cmd: t('"Add a slide about Q3 costs"', '「Q3コストのスライドを追加して」'), flow: t('Generate new slide JSON from context → append to deck → navigate to new slide', 'コンテキストから新しいSlide JSONを生成 → デッキに追加 → 新しいスライドに移動') },
            ].map((ex, i) => (
              <div key={i} className="reveal border border-[var(--background-200)] p-4" style={stagger(i + 4)}>
                <p className="text-[var(--accent-500)] font-medium text-sm mb-1">{ex.cmd}</p>
                <p className="text-[var(--text-500)] text-xs">{ex.flow}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-[var(--text-500)] text-xs mt-3 italic" style={stagger(7)}>{t('Technical: Gemini function calling with Slide JSON as the tool schema.', '技術：Slide JSONをツールスキーマとしたGeminiファンクションコール。')}</p>
        </div>

        {/* Translation */}
        <div>
          <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(3)}>{t('Layout-Safe Translation', 'レイアウト保持翻訳')}</p>
          <div className="reveal grid grid-cols-3 gap-3 mb-4" style={stagger(8)}>
            <div className="border border-[var(--background-200)] p-3 text-center">
              <p className="text-[var(--text-500)] text-[10px] uppercase mb-2">{t('English', '英語')}</p>
              <div className="bg-[var(--primary-100)] p-2"><p className="text-[var(--text-800)] text-xs">Q3 Results</p></div>
              <p className="text-[var(--primary-500)] text-[10px] mt-1">OK</p>
            </div>
            <div className="border border-[var(--danger)] p-3 text-center">
              <p className="text-[var(--danger)] text-[10px] uppercase mb-2">{t('Naive', '単純')}</p>
              <div className="bg-[var(--danger-bg)] p-2 overflow-hidden"><p className="text-[var(--text-800)] text-xs whitespace-nowrap">第3四半期の業績結果報告</p></div>
              <p className="text-[var(--danger)] text-[10px] mt-1">{t('Overflow', 'はみ出し')}</p>
            </div>
            <div className="border border-[var(--accent-500)] p-3 text-center">
              <p className="text-[var(--accent-500)] text-[10px] uppercase mb-2">{t('Constrained', '制約付き')}</p>
              <div className="bg-[var(--primary-100)] p-2"><p className="text-[var(--text-800)] text-xs">Q3実績</p></div>
              <p className="text-[var(--accent-500)] text-[10px] mt-1">OK</p>
            </div>
          </div>
          <div className="reveal space-y-2" style={stagger(9)}>
            {[
              t('1. Extract text + bounding box dimensions from Slide JSON', '1. Slide JSONからテキスト＋バウンディングボックスを抽出'),
              t('2. Calculate max character budget per block', '2. ブロックごとの最大文字数を算出'),
              t('3. Prompt Gemini: "Translate in ≤ N characters"', '3. Geminiプロンプト：「N文字以内で翻訳」'),
              t('4. Validate fit → re-prompt if overflow', '4. フィットを検証 → はみ出しなら再プロンプト'),
            ].map((step, i) => (
              <p key={i} className="text-[var(--text-600)] text-xs">{step}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="reveal flex items-center gap-3 pt-4 border-t border-[var(--background-200)]" style={stagger(10)}>
        <span className="w-2.5 h-2.5 bg-[var(--accent-500)] rounded-full" />
        <p className="text-[var(--text-700)] text-sm">{t('My AI engineering experience makes this phase efficient — I know how to design prompts that work.', 'AIエンジニアリングの経験がこのフェーズを効率的にする — 動くプロンプトの設計方法を知っている。')}</p>
      </div>
    </section>
  );
};

const StrategyPolish = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Phase 5: Polish & Validate"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S6 — POLISH & VALIDATE', 'S6 — 仕上げ＆検証')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Phase 5: Demo-Ready', 'Phase 5: デモ準備完了')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('Week 15-16 — End-to-end flow, Honda template, feedback loop', '15-16週目 — E2Eフロー、Hondaテンプレート、フィードバックループ')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: t('End-to-End Test', 'E2Eテスト'), items: [t('Upload a real Honda trip report', '実際のHonda出張報告書をアップロード'), t('Generate slides with AI', 'AIでスライド生成'), t('Edit via chat AND canvas', 'チャットとキャンバスの両方で編集'), t('Export PPTX → open in PowerPoint', 'PPTXエクスポート → PowerPointで開く'), t('Translate JP ↔ EN', '日英翻訳')] },
          { title: t('Honda Template', 'Hondaテンプレート'), items: [t('Corporate colors (Honda red, grey)', 'コーポレートカラー（Honda赤、グレー）'), t('Logo placement rules', 'ロゴ配置ルール'), t('Standard font stack', '標準フォントスタック'), t('Title / Content / Two-column layouts', 'タイトル/コンテンツ/2カラムレイアウト'), t('Footer with department info', '部署情報付きフッター')] },
          { title: t('User Feedback', 'ユーザーフィードバック'), items: [t('Demo to 5 target users', 'ターゲットユーザー5名にデモ'), t('"Try generating from your own document"', '「自分のドキュメントから生成してみて」'), t('Collect: satisfaction, pain points, suggestions', '収集：満足度、課題、提案'), t('Document learnings for pitch to management', '経営層へのピッチ用に学びを文書化'), t('Iterate on top 3 issues', '上位3つの課題を改善')] },
        ].map((col, i) => (
          <div key={i} className="reveal border border-[var(--background-200)] p-5" style={stagger(i + 3)}>
            <p className="text-[var(--text-950)] font-bold text-base mb-3">{col.title}</p>
            <div className="space-y-2">
              {col.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-500)] mt-1.5 flex-shrink-0" />
                  <p className="text-[var(--text-600)] text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="reveal bg-[var(--accent-500)] p-5" style={stagger(6)}>
        <p className="text-white font-bold text-base">{t('Success = One Convincing Demo', '成功 = 1つの説得力あるデモ')}</p>
        <p className="text-white/80 text-sm mt-1">{t('If I can upload a real trip report and generate, edit, translate, and export a polished deck in under 15 minutes — the PoC is proven.', '実際の出張報告書をアップロードし、15分以内に生成・編集・翻訳・エクスポートできれば — PoCは実証された。')}</p>
      </div>
    </section>
  );
};

const StrategyToolkit = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Solo Builder Toolkit"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S7 — TOOLKIT', 'S7 — ツールキット')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Solo Builder Toolkit', 'ソロビルダーツールキット')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-8" style={stagger(2)}>{t('Tech stack optimized for one person — build only what I must, use everything else', '一人用に最適化されたテックスタック — 必要なものだけ作り、残りは既存を活用')}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { layer: t('Frontend', 'フロントエンド'), tech: 'React + Vite', why: t('Fast HMR, I know it well', '高速HMR、熟知している') },
          { layer: t('Styling', 'スタイリング'), tech: 'Tailwind CSS', why: t('No CSS files, rapid iteration', 'CSSファイル不要、高速反復') },
          { layer: t('Canvas', 'キャンバス'), tech: 'Fabric.js', why: t('Mature, object model, handles built-in', '成熟、オブジェクトモデル、ハンドル内蔵') },
          { layer: t('Backend', 'バックエンド'), tech: 'FastAPI', why: t('Minimal Python, async, easy deploy', '最小Python、async、簡単デプロイ') },
          { layer: 'AI', tech: 'Gemini API', why: t("Honda's GCP — no approval needed", 'HondaのGCP — 承認不要') },
          { layer: 'PPTX', tech: 'python-pptx', why: t('Only real option for native PPTX', 'ネイティブPPTX唯一の選択肢') },
        ].map((s, i) => (
          <div key={i} className="reveal border border-[var(--background-200)] p-4" style={stagger(i + 3)}>
            <p className="font-mono text-[var(--accent-500)] text-[10px] tracking-widest uppercase">{s.layer}</p>
            <p className="text-[var(--text-950)] font-bold text-base mt-1">{s.tech}</p>
            <p className="text-[var(--text-500)] text-xs mt-1">{s.why}</p>
          </div>
        ))}
      </div>

      {/* Force multipliers */}
      <p className="reveal font-mono text-[var(--text-400)] text-xs tracking-widest uppercase mb-4" style={stagger(9)}>{t('Solo Force Multipliers', 'ソロの力を倍増させるもの')}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: t('Claude / Copilot for Code', 'Claude / Copilot でコード'), desc: t('AI pair programming — I design the architecture, AI writes the boilerplate. 2x faster on backend work.', 'AIペアプログラミング — アーキテクチャは自分で設計、定型コードはAIが記述。バックエンド作業が2倍速。') },
          { title: t('Figma → Code Pipeline', 'Figma → コード パイプライン'), desc: t('Prototype in Figma first, then translate to React. My design-to-code speed is my biggest advantage.', 'まずFigmaでプロトタイプ、次にReactに変換。デザインからコードへの速度が最大の強み。') },
          { title: t('Off-the-shelf UI', '既製UIコンポーネント'), desc: t('shadcn/ui + Radix for panels and dialogs. Don\'t reinvent dropdowns — save energy for the hard problems.', 'パネルとダイアログにshadcn/ui + Radix。ドロップダウンを再発明しない — 難しい問題にエネルギーを残す。') },
        ].map((item, i) => (
          <div key={i} className="reveal border-l-2 border-[var(--accent-500)] pl-4" style={stagger(i + 10)}>
            <p className="text-[var(--text-950)] font-semibold text-sm">{item.title}</p>
            <p className="text-[var(--text-600)] text-xs mt-1 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const StrategyTimeline = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Solo Timeline"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S8 — TIMELINE', 'S8 — タイムライン')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-1" style={stagger(1)}>{t('Solo Timeline', 'ソロタイムライン')}</h2>
      <p className="reveal text-[var(--text-600)] text-lg mb-6" style={stagger(2)}>{t('16 weeks — one person — working PoC', '16週間 — 一人 — 動くPoC')}</p>

      {/* Gantt */}
      <div className="reveal flex gap-1 mb-4 pl-44" style={stagger(3)}>
        {Array.from({ length: 16 }, (_, i) => `W${i + 1}`).map(w => (
          <div key={w} className="flex-1 text-center font-mono text-[var(--text-500)] text-[9px]">{w}</div>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        {[
          { name: t('Phase 1: Design Sprint', 'Phase 1: デザインスプリント'), color: 'bg-[var(--warning)]', start: 0, width: 12.5 },
          { name: t('Phase 2: Slide Engine', 'Phase 2: スライドエンジン'), color: 'bg-[var(--accent-500)]', start: 12.5, width: 25 },
          { name: t('Phase 3: Canvas UI', 'Phase 3: キャンバスUI'), color: 'bg-[var(--primary-500)]', start: 37.5, width: 25 },
          { name: t('Phase 4: AI Chat + Translate', 'Phase 4: AIチャット + 翻訳'), color: 'bg-[var(--primary-400)]', start: 62.5, width: 25 },
          { name: t('Phase 5: Polish & Demo', 'Phase 5: 仕上げ＆デモ'), color: 'bg-[var(--secondary-400)]', start: 87.5, width: 12.5 },
        ].map((phase, i) => (
          <div key={i} className="reveal flex items-center gap-4" style={stagger(i + 4)}>
            <div className="w-40 text-right flex-shrink-0">
              <p className="text-[var(--text-800)] text-xs font-medium truncate">{phase.name}</p>
            </div>
            <div className="flex-1 relative h-6 bg-[var(--background-100)]">
              <div
                className={`gantt-bar absolute h-full ${phase.color}`}
                style={{ left: `${phase.start}%`, width: `${phase.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Gates */}
      <div className="reveal flex flex-wrap gap-6 mb-6 pt-4 border-t border-[var(--background-200)]" style={stagger(9)}>
        {[
          { gate: t('Gate 1', 'ゲート1'), when: t('End of Week 2', '2週目終了'), check: t('Do users want this?', 'ユーザーはこれを望んでいるか？') },
          { gate: t('Gate 2', 'ゲート2'), when: t('End of Week 6', '6週目終了'), check: t('Can PPTX export work?', 'PPTXエクスポートは機能するか？') },
          { gate: t('Gate 3', 'ゲート3'), when: t('End of Week 16', '16週目終了'), check: t('Can I demo end-to-end?', 'E2Eデモは可能か？') },
        ].map((g, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[var(--danger)] rounded-full" />
            <div>
              <p className="text-[var(--text-950)] text-sm font-semibold">{g.gate} <span className="text-[var(--text-400)] font-normal">— {g.when}</span></p>
              <p className="text-[var(--text-600)] text-xs">{g.check}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reality check */}
      <div className="reveal border-l-4 border-[var(--warning)] pl-5" style={stagger(10)}>
        <p className="text-[var(--text-950)] font-semibold text-sm">{t('Reality Check', '現実確認')}</p>
        <p className="text-[var(--text-600)] text-sm mt-1">{t('16 weeks assumes ~20 hours/week alongside regular work. If full-time, could compress to 8-10 weeks. Adjust based on actual bandwidth.', '16週間は通常業務と並行して週約20時間を想定。フルタイムなら8-10週間に圧縮可能。実際の帯域に基づいて調整。')}</p>
      </div>
    </section>
  );
};

const StrategySummary = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Strategy Summary"
    >
      <p className="reveal font-mono text-[var(--accent-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>{t('S9 — SUMMARY', 'S9 — まとめ')}</p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-8" style={stagger(1)}>{t('My Principles', '私の原則')}</h2>

      <div className="space-y-4 mb-8">
        {[
          { num: '01', title: t('Design the experience first, engineer the intelligence second.', '体験を先にデザインし、インテリジェンスは後からエンジニアリング。'), desc: t('Figma before FastAPI. User flow before system architecture.', 'FastAPIの前にFigma。システムアーキテクチャの前にユーザーフロー。') },
          { num: '02', title: t('Build for one user, not fifty.', '50人ではなく、1人のユーザーのために構築。'), desc: t('The PoC only needs to impress one decision-maker. Ship fast, iterate later.', 'PoCは一人の意思決定者を感動させれば良い。素早くリリースし、後で改善。') },
          { num: '03', title: t('Leverage AI to build AI.', 'AIを使ってAIを構築。'), desc: t('Claude writes my boilerplate. Gemini generates my slides. I focus on what only I can do: the design decisions.', 'Claudeが定型コードを書く。Geminiがスライドを生成。私は自分にしかできないことに集中：デザインの意思決定。') },
          { num: '04', title: t('What you see IS what you export.', '見たままがエクスポートされる。'), desc: t('No visual lies. The Slide JSON schema is the contract between canvas and PPTX.', 'ビジュアルの嘘なし。Slide JSONスキーマがキャンバスとPPTXの契約。') },
          { num: '05', title: t('Gates kill bad ideas early.', 'ゲートが悪いアイデアを早期に排除。'), desc: t("Three checkpoints. If the answer is 'no' at any gate, I pivot — not push through.", '3つのチェックポイント。どのゲートでも答えが「No」なら、押し通さずにピボット。') },
        ].map((p, i) => (
          <div key={i} className="reveal flex items-start gap-5" style={stagger(i + 2)}>
            <span className="text-3xl font-bold font-mono text-[var(--accent-500)] w-12 flex-shrink-0">{p.num}</span>
            <div>
              <p className="text-[var(--text-950)] font-semibold text-base">{p.title}</p>
              <p className="text-[var(--text-600)] text-sm mt-1">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="reveal bg-[var(--accent-500)] p-6" style={stagger(7)}>
        <p className="text-white text-xl font-bold mb-2">{t('The DECK is the vision. This roadmap is how I get there.', 'DECKはビジョン。このロードマップはそこへの道筋。')}</p>
        <p className="text-white/80 text-base">{t('One AI Product Designer. One PoC. One demo that changes everything.', '一人のAIプロダクトデザイナー。一つのPoC。全てを変える一つのデモ。')}</p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   Scroll-driven narrative with dot indicator
   ═══════════════════════════════════════════════ */
const sections = [
  Section0, Section1, Section2, Section3, Section4,
  SectionWhySlideLink,
  SectionDemo, SectionPointEdit,
  Section5, Section6, Section7, Section8,
  // SectionROI, // TODO: re-enable after budget analysis
  Section9, Section10,
  SectionRisks, SectionMetrics,
  Section11,
  SectionNextSteps,
  Section12,
];

const strategySections = [
  StrategyTitle, StrategyEdge, StrategyScope, StrategyDesignSprint,
  StrategySlideEngine, StrategyCanvasUI, StrategyAIChat,
  StrategyPolish, StrategyToolkit, StrategyTimeline, StrategySummary,
];

const sectionLabelsMap = {
  proposal: {
    en: [
      'Title', 'Background', 'Problem', 'Related Work', 'Solution',
      'Why SlideLink', 'Interface', 'Two Ways to Edit',
      'Users', 'Personas', 'Business Trip', 'Data Journey',
      'Architecture', 'Data', 'Risks', 'Metrics',
      'Timeline', 'Next Steps', 'Close',
    ],
    jp: [
      'タイトル', '背景', '課題', '関連事例', 'ソリューション',
      'なぜSlideLink', 'インターフェース', '2つの編集方法',
      'ユーザー', 'ペルソナ', '出張', 'データ活用',
      'アーキテクチャ', 'データ', 'リスク', '指標',
      'タイムライン', 'ネクストステップ', 'クロージング',
    ],
  },
  strategy: {
    en: [
      'Roadmap', 'My Edge', 'Scope', 'Design Sprint',
      'Slide Engine', 'Canvas UI', 'AI + Translate',
      'Polish', 'Toolkit', 'Timeline', 'Principles',
    ],
    jp: [
      'ロードマップ', '私の強み', 'スコープ', 'デザインスプリント',
      'スライドエンジン', 'キャンバスUI', 'AI＋翻訳',
      '仕上げ', 'ツールキット', 'タイムライン', '原則',
    ],
  },
};

const SlidePresentation = () => {
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('en');
  const [viewMode, setViewMode] = useState('proposal');

  const activeSections = viewMode === 'proposal' ? sections : strategySections;
  const activeLabels = sectionLabelsMap[viewMode][lang];
  const total = activeSections.length;

  const toggleViewMode = useCallback(() => {
    setViewMode(v => v === 'proposal' ? 'strategy' : 'proposal');
    setCurrentSection(0);
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  // Track current section via Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = sectionRefs.current.indexOf(entry.target);
            if (idx !== -1) setCurrentSection(idx);
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [viewMode]);

  // Keyboard navigation — section jumping
  useEffect(() => {
    const handler = (e) => {
      let target = null;
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          target = Math.min(currentSection + 1, total - 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          target = Math.max(currentSection - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          target = 0;
          break;
        case 'End':
          e.preventDefault();
          target = total - 1;
          break;
        default:
          return;
      }
      if (target !== null && sectionRefs.current[target]) {
        sectionRefs.current[target].scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentSection, total]);

  const scrollTo = useCallback((idx) => {
    if (sectionRefs.current[idx]) {
      sectionRefs.current[idx].scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${isDark ? 'dark' : ''} h-screen w-screen overflow-y-auto scroll-container bg-[var(--background-50)] font-[Poppins] relative`}
      tabIndex={0}
      aria-label={viewMode === 'proposal' ? 'SlideLink Proposal' : 'SlideLink Strategy'}
    >
      {/* ── Theme Toggle (top-left) ── */}
      <button
        onClick={() => setIsDark(d => !d)}
        className="fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-[var(--background-100)] border border-[var(--background-200)] text-[var(--text-600)] hover:text-[var(--text-800)] transition-colors cursor-pointer"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* ── Language Toggle (top-left, below theme) ── */}
      <button
        onClick={() => setLang(l => l === 'en' ? 'jp' : 'en')}
        className="fixed top-16 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-[var(--background-100)] border border-[var(--background-200)] text-[var(--text-600)] hover:text-[var(--text-800)] transition-colors cursor-pointer text-xs font-bold"
        aria-label={lang === 'en' ? 'Switch to Japanese' : 'Switch to English'}
      >
        {lang === 'en' ? 'JP' : 'EN'}
      </button>

      {/* ── View Mode Toggle (top-left, below language) ── */}
      <button
        onClick={toggleViewMode}
        className={`fixed top-28 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-full border transition-colors cursor-pointer text-xs font-bold ${
          viewMode === 'strategy'
            ? 'bg-[var(--accent-500)] border-[var(--accent-600)] text-white'
            : 'bg-[var(--background-100)] border-[var(--background-200)] text-[var(--text-600)] hover:text-[var(--text-800)]'
        }`}
        aria-label={viewMode === 'proposal'
          ? (lang === 'jp' ? '戦略ビューに切替' : 'Switch to Strategy view')
          : (lang === 'jp' ? '提案ビューに切替' : 'Switch to Proposal view')
        }
      >
        {viewMode === 'proposal' ? 'REC' : 'DECK'}
      </button>

      {/* ── Dot Indicator (right edge) with hover tooltips ── */}
      <nav
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5"
        aria-label="Section navigation"
      >
        {activeLabels.map((label, i) => (
          <div key={i} className="group relative flex items-center justify-end">
            {/* Tooltip bubble — appears on hover, left of dot */}
            <span className="absolute right-5 whitespace-nowrap px-2.5 py-1 rounded bg-[var(--background-100)] border border-[var(--background-200)] text-[var(--text-800)] text-xs font-medium opacity-0 pointer-events-none translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-lg">
              {label}
            </span>
            <button
              onClick={() => scrollTo(i)}
              aria-label={`Go to ${label}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2 focus:ring-offset-[var(--background-50)] ${
                i === currentSection
                  ? 'bg-[var(--primary-500)] scale-150'
                  : 'bg-[var(--text-400)] hover:bg-[var(--primary-500)] hover:scale-125'
              }`}
            />
          </div>
        ))}
      </nav>

      {/* ── Aria live region ── */}
      <div aria-live="polite" className="sr-only">
        Section {currentSection + 1} of {total}: {activeLabels[currentSection]}
      </div>

      {/* ── Sections ── */}
      <LanguageContext.Provider value={lang}>
        {activeSections.map((SectionComp, i) => (
          <div
            key={`${viewMode}-${i}`}
            ref={(el) => { sectionRefs.current[i] = el; }}
            className="scroll-section"
          >
            <SectionComp />
          </div>
        ))}
      </LanguageContext.Provider>
    </div>
  );
};

export default SlidePresentation;
