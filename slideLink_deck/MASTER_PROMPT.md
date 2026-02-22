# SlideLink Project — Master Prompt

## Who I Am

Raihan Satria — AI Product Designer at Honda (background: UI/UX Designer, current role: AI Engineer). I'm building SlideLink as a solo personal proposed idea project. Everything — design, frontend, backend, AI integration — is done by me.

## What SlideLink Is

An agentic AI-powered presentation generation system proposed for Honda internal use. Users upload documents (PDF, DOCX, TXT), an AI agent generates editable slides, and users refine them via a Canva-style canvas editor or Genspark-style chat panel, then export to native editable PPTX.

**Core value proposition:** "Best of Three Worlds"
- **NotebookLM** quality output (AI-generated visuals, smart extraction)
- **Genspark** interaction (chat-based AI editing, agent chain-of-thought)
- **Canva** editing (drag & drop, resize handles, properties panel)

**Key differentiator:** Fully editable PPTX export with native charts (not screenshots), layout-preserving JP ↔ EN translation, and zero data leakage (Honda GCP deployment).

## Project Structure

```
/home/reysatria/slide/
├── app/
│   ├── src/
│   │   ├── SlidePresentation.jsx   # Main file (~2775 lines, ALL sections live here)
│   │   ├── index.css               # CSS variables, animations, theme (light/dark)
│   │   ├── App.jsx                 # Just renders <SlidePresentation />
│   │   └── main.jsx                # React entry point
│   ├── package.json                # Vite + React 19 + lucide-react
│   └── vite.config.js
└── MASTER_PROMPT.md                # This file
```

**This is a single-file architecture.** All 19 proposal sections + 11 strategy sections + main component live in `SlidePresentation.jsx`. No routing, no separate files per section.

## Build & Dev Commands

```bash
# MUST use Node 22 via nvm
cd /home/reysatria/slide/app && source ~/.nvm/nvm.sh && nvm use 22

# Dev server
npx vite --port 3001

# Production build (use this to verify changes)
npx vite build
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS 4 + CSS custom properties (light/dark themes) |
| Icons | lucide-react (NO emojis — explicitly removed) |
| Fonts | Poppins (Google Fonts) |
| Animations | IntersectionObserver (`useScrollReveal` hook) + CSS transitions |

## Two Views: DECK (Proposal) and REC (Strategy)

The app has a `viewMode` state that toggles between two completely separate slide decks:

### DECK — Proposal (19 sections)
The pitch deck shown to Honda managers. Professional tone.

| # | Component | Label |
|---|-----------|-------|
| 0 | Section0 | Title (Hero) |
| 1 | Section1 | Background |
| 2 | Section2 | Problem |
| 3 | Section3 | Related Work (comparison table) |
| 4 | Section4 | Solution — Best of Three Worlds |
| 5 | SectionWhySlideLink | Why SlideLink (competitor limitations) |
| 6 | SectionDemo | Interface (Genspark chat + Canva canvas mock) |
| 7 | SectionPointEdit | Two Ways to Edit |
| 8 | Section5 | Target Users |
| 9 | Section6 | Personas (Tanaka-san / Suzuki-san split) |
| 10 | Section7 | Business Trip Journey |
| 11 | Section8 | Data Presenter Journey |
| 12 | Section9 | Architecture (animated 5-stage pipeline) |
| 13 | Section10 | Data & Security |
| 14 | SectionRisks | Risks & Mitigation |
| 15 | SectionMetrics | Pilot Success Criteria |
| 16 | Section11 | Timeline (Gantt chart) |
| 17 | SectionNextSteps | Next Steps / The Ask |
| 18 | Section12 | Thank You (closing) |

Note: `SectionROI` exists but is commented out (`// TODO: re-enable after budget analysis`).

### REC — Strategy (11 sections)
My personal PoC roadmap as an AI Product Designer. Detailed, personal tone.

| # | Component | Label |
|---|-----------|-------|
| 0 | StrategyTitle | Roadmap — "Building SlideLink" hero |
| 1 | StrategyEdge | My Edge — skills profile with progress bars |
| 2 | StrategyScope | PoC Scope — IN vs OUT lists |
| 3 | StrategyDesignSprint | Phase 1: Design Sprint (Week 1-2) |
| 4 | StrategySlideEngine | Phase 2: Slide Engine (Week 3-6) |
| 5 | StrategyCanvasUI | Phase 3: Canvas UI (Week 7-10) |
| 6 | StrategyAIChat | Phase 4: AI Chat + Translation (Week 11-14) |
| 7 | StrategyPolish | Phase 5: Polish & Demo (Week 15-16) |
| 8 | StrategyToolkit | Solo Builder Toolkit — tech stack + force multipliers |
| 9 | StrategyTimeline | 16-week solo Gantt with 3 go/no-go gates |
| 10 | StrategySummary | My Principles — 5 design principles + closing callout |

## Key Architecture Patterns

### Bilingual Support (EN/JP)
Every section is bilingual. The toggle switches ALL content.

```jsx
// Context (defined once, near top of file)
const LanguageContext = React.createContext('en');
const useLang = () => React.useContext(LanguageContext);

// Inside every section component:
const lang = useLang();
const t = (en, jp) => lang === 'jp' ? jp : en;

// Usage:
<h2>{t('Target Users', 'ターゲットユーザー')}</h2>
```

### Section Component Pattern
Every section follows this exact template:

```jsx
const SectionX = () => {
  const ref = useScrollReveal();
  const lang = useLang();
  const t = (en, jp) => lang === 'jp' ? jp : en;
  return (
    <section
      ref={ref}
      className="scroll-section h-screen overflow-hidden flex flex-col justify-center px-10 md:px-20 py-10"
      aria-label="Section Name"
    >
      <p className="reveal font-mono text-[var(--primary-500)] text-sm mb-4 tracking-wide" style={stagger(0)}>
        {t('XX — LABEL', 'XX — ラベル')}
      </p>
      <h2 className="reveal text-4xl md:text-5xl font-bold text-[var(--text-950)] mb-..." style={stagger(1)}>
        {t('Title', 'タイトル')}
      </h2>
      {/* Content with reveal classes and stagger() delays */}
    </section>
  );
};
```

### Animation System
- `useScrollReveal()` — IntersectionObserver hook, adds `.revealed` class when element is 50% visible
- `stagger(index, base=100)` — returns `{ transitionDelay: '${index * base}ms' }` for cascading animations
- CSS classes: `.reveal` (fade up), `.reveal-line` (width grow), `.gantt-bar` (width grow)
- Respects `prefers-reduced-motion`

### View Mode System
```jsx
// State in main component
const [viewMode, setViewMode] = useState('proposal');

// Derived values
const activeSections = viewMode === 'proposal' ? sections : strategySections;
const activeLabels = sectionLabelsMap[viewMode][lang];
const total = activeSections.length;
```

### Section Labels Map (bilingual, per view)
```jsx
const sectionLabelsMap = {
  proposal: { en: [...19 labels...], jp: [...19 labels...] },
  strategy: { en: [...11 labels...], jp: [...11 labels...] },
};
```

### Three Fixed Buttons (top-left)
1. **Theme toggle** — `top-4 left-4` — Sun/Moon icons, toggles `isDark`
2. **Language toggle** — `top-16 left-4` — Shows "JP" or "EN", toggles `lang`
3. **View mode toggle** — `top-28 left-4` — Shows "REC" (muted) or "DECK" (accent-colored), toggles `viewMode`

### Sidebar Navigation
Right edge dot indicators. Each dot = one section. Click to scroll. Hover shows label tooltip. Active dot is enlarged and primary-colored.

## Color System (CSS Variables)
- Proposal sections use `var(--primary-500)` (teal) for accent
- Strategy sections use `var(--accent-500)` (cyan) for accent
- Danger: `var(--danger)`, Warning: `var(--warning)`
- Text scale: `--text-400` (muted) through `--text-950` (darkest)
- Background: `--background-50` (lightest) through `--background-200`
- Both light and dark themes defined in `index.css`

## Section 9 (Architecture) — Special Behavior
This section has a phase-based animation state machine (0-5) with an IntersectionObserver that starts/stops the animation. It uses `sectionRef` (not `ref` from useScrollReveal) and a `phase` state with a setTimeout timer that advances every 2 seconds. Has its own useEffect with `[]` dependency (NOT `[viewMode]`).

## Hard Rules
- **NO emojis.** All icons use lucide-react components. This was explicitly requested.
- **"Conference" is renamed to "Business Trip"** throughout.
- **SectionROI is commented out** — don't re-enable without being asked.
- **Single-file architecture** — don't split into separate files unless asked.
- **Node 22 required** — always use `source ~/.nvm/nvm.sh && nvm use 22` before builds.
- **File modification race condition** — The IDE linter/formatter sometimes modifies the file during edits. When making many changes, use a Python batch script to apply all edits atomically instead of multiple Edit tool calls.

## Comprehensive Analysis — What I Know About SlideLink

A thorough technical and strategic review was conducted on this proposal. The findings below should inform all future work.

### Strengths
1. **Real pain point.** Honda employees genuinely spend 4-8 hours per presentation. Business trip reporting culture + bilingual requirements amplify the problem.
2. **Clear positioning.** "Best of Three Worlds" is an effective narrative — each competitor (NotebookLM, Genspark, Canva) has a specific gap, and SlideLink fills all three.
3. **Strong security story.** Honda GCP tenant, Gemini API via Honda's enterprise agreement, session-based storage, no persistent data retention. EU AI Act / GDPR / ISO 27001 framing is solid.
4. **Dual editing mode** (chat + canvas) is a genuine differentiator no single competitor offers today.
5. **The personas** (Tanaka-san the engineer, Suzuki-san the analyst) make the problem concrete and relatable.

### Weaknesses & Risks
1. **HTML Canvas → PPTX is the hardest unsolved problem.** The proposal calls it "Medium" risk — it's actually **High**. python-pptx can create slides but matching a rich Fabric.js canvas 1:1 is a different challenge. The "hybrid approach" (native for simple, image for complex) contradicts the core "not screenshots" value prop.
2. **Multi-agent architecture may be premature.** 4 agents (Builder, Designer, Data, Research) add coordination overhead. A single well-prompted Gemini call with structured output handles most slide generation at PoC stage. Decompose into agents later when there's data showing where the single agent fails.
3. **ROI numbers are aggressive.** The proposal claims 95% time savings (5h → 25min) and ¥116M/year for 50 users. More credible: 50-60% savings initially, measured during pilot.
4. **The "companies send 2-3 people to share report workload" claim** needs validation through actual user interviews.
5. **Timeline in the DECK (4 months, 2.5 people) is unrealistic** for the full scope. The REC view corrects this to 16 weeks solo for a PoC.
6. **Broader competitive landscape** not addressed — Gamma.app, Tome, Beautiful.ai, SlidesAI.io all exist in this space.
7. **The Research agent fetching from web URLs** is in tension with "zero data leakage" — needs clarification on proxy/whitelisting within Honda's security perimeter.

### Critical Technical Decisions

**The Shared Slide JSON Schema (most important architecture decision):**
Don't convert canvas → PPTX. Instead, define a schema that BOTH Fabric.js and python-pptx can render:
```
Gemini → Slide JSON Schema → Fabric.js (for screen)
                            → python-pptx (for export)
```
Both are views of the same data. No conversion = no fidelity gap. Tradeoff: canvas visuals are constrained to what PPTX can represent. That's the right tradeoff.

**Translation approach:**
Extract text + bounding box dimensions from Slide JSON → calculate max character budget per block → prompt Gemini: "Translate in ≤ N characters" → validate fit → re-prompt if overflow. Works at the schema level, not pixel level.

**Single agent first:**
Start with one Gemini call using structured JSON output. Add agent specialization only when data from usage shows where the single agent fails. This is captured in the REC Phase 4 rationale.

### What's Missing From the Proposal (gaps to address later)
- Error recovery and fallback when AI generates bad output
- Model cost projections (Gemini API calls per presentation at scale)
- Collaboration features (can multiple people work on the same deck?)
- Versioning (can users revert to a previous slide version?)
- Offline capability (business trips may have limited connectivity)
- Template authoring workflow (who creates Honda templates? How maintained?)
- Accessibility / WCAG compliance for the canvas interface

## How to Continue This Project

### Current State (as of Feb 2026)
- The **scroll-driven proposal deck** (DECK view) is complete with 19 sections, fully bilingual EN/JP
- The **personal strategy roadmap** (REC view) is complete with 11 sections, fully bilingual
- Both views have dark/light theme support
- This is a **presentation only** — the actual SlideLink product has not been built yet

### Next Steps — Following the REC Roadmap

**Phase 1: Design Sprint (Week 1-2)**
- Create Figma wireframes for the core flow: Upload → Generate → Edit → Export
- Design the chat + canvas split layout
- Define the Slide JSON schema on paper
- Build a clickable Figma prototype
- Validate with 3-5 Honda colleagues
- **Gate:** If < 3/5 users see value, pivot before investing dev time

**Phase 2: Slide Engine (Week 3-6)**
- Set up FastAPI backend project
- Define the Slide JSON schema (element types: text, image, shape, chart with position/size/style)
- Build Gemini prompt engineering for structured JSON output from documents
- Build python-pptx rendering from Slide JSON
- Test PPTX fidelity with real Honda documents
- **Gate:** If PPTX fidelity < 80%, fall back to PDF export for PoC

**Phase 3: Canvas UI (Week 7-10)**
- Set up React + Fabric.js frontend
- Render Slide JSON → Fabric.js canvas objects
- Implement selection, drag, resize, text editing
- Build properties panel (font, color, size, alignment)
- Build slide thumbnails sidebar
- Connect canvas edits back to Slide JSON (bidirectional sync)

**Phase 4: AI Chat + Translation (Week 11-14)**
- Add chat panel UI alongside canvas
- Implement Gemini function calling with Slide JSON as tool schema
- Chat commands modify Slide JSON → canvas re-renders
- Build translation: extract text + bounding boxes → constrained translation → validate fit

**Phase 5: Polish & Demo (Week 15-16)**
- End-to-end test with a real Honda trip report
- Honda template (colors, fonts, logo)
- Demo to 5 target users, collect feedback
- Iterate on top 3 issues
- Prepare pitch to management using the DECK view

### Solo Force Multipliers
- **Claude / Copilot** for backend boilerplate and python-pptx code
- **Figma → code pipeline** — prototype first, then translate to React
- **shadcn/ui + Radix** for panels, dialogs, dropdowns — don't reinvent UI primitives
- **This presentation itself** as the pitch artifact — it demonstrates design thinking

### Project Principles
1. Design the experience first, engineer the intelligence second
2. Build for one user, not fifty — the PoC only needs to impress one decision-maker
3. Leverage AI to build AI — Claude writes boilerplate, Gemini generates slides, focus on design decisions
4. What you see IS what you export — Slide JSON is the contract between canvas and PPTX
5. Gates kill bad ideas early — three checkpoints, pivot if the answer is "no"

## Common Modification Patterns

### Adding a new section
1. Write the component following the section pattern above
2. Add it to the `sections` or `strategySections` array
3. Add labels to `sectionLabelsMap` for both `en` and `jp`
4. The total is derived automatically (`activeSections.length`)

### Modifying content
All user-visible strings are wrapped in `t('English', '日本語')`. When modifying text, update BOTH languages.

### Adding new icons
Import from lucide-react at the top of the file. Current imports:
```jsx
import { ArrowRight, Sun, Moon, Upload, Cpu, Download, Pencil, Palette, BarChart3, Search, Zap } from 'lucide-react';
```
