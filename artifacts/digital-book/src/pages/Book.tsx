import { useRef, useState, useEffect, useCallback } from "react";
import "@/styles/book.css";

/* ──────────────────────────────────────────────────────────
   PER-CHAPTER GENERATIVE VISUALS  (pure SVG, depth-driven)
   ────────────────────────────────────────────────────────── */

function VisualSilence({ depth }: { depth: number }) {
  // Concentric ripples — silence as expanding stillness
  return (
    <svg className="chapter-visual" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: 7 }).map((_, i) => {
        const r = 8 + i * 12 + depth * 22 + Math.sin((depth + i * 0.5) * 1.6) * 1.4;
        const op = Math.max(0, 0.22 - i * 0.025 - depth * 0.04);
        return (
          <circle
            key={i}
            cx="0"
            cy="0"
            r={r}
            fill="none"
            stroke="white"
            strokeOpacity={op}
            strokeWidth={0.35}
          />
        );
      })}
      <circle cx="0" cy="0" r={1.2} fill="white" fillOpacity={0.45 - depth * 0.2} />
    </svg>
  );
}

function VisualLines({ depth }: { depth: number }) {
  // Horizontal strokes warping into curves — boundaries dissolving
  const lines = Array.from({ length: 13 });
  return (
    <svg className="chapter-visual" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet">
      {lines.map((_, i) => {
        const y = -78 + i * 13;
        const warp = Math.sin(i * 0.55 + depth * 3.4) * (4 + depth * 18);
        const op = Math.max(0.04, 0.24 - i * 0.012 - depth * 0.05);
        return (
          <path
            key={i}
            d={`M -88 ${y} Q -30 ${y + warp} 0 ${y} T 88 ${y - warp * 0.4}`}
            stroke="white"
            strokeOpacity={op}
            strokeWidth={0.4}
            fill="none"
          />
        );
      })}
    </svg>
  );
}

function VisualParticles({ depth }: { depth: number }) {
  // Phyllotaxis spiral — meaning collapsing into specific points
  const dots = Array.from({ length: 90 });
  const golden = Math.PI * (3 - Math.sqrt(5));
  return (
    <svg className="chapter-visual" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet">
      {dots.map((_, i) => {
        const angle = i * golden + depth * 0.35;
        const baseR = Math.sqrt(i) * 8.2;
        const r = baseR * (1 + depth * 0.35);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const op = Math.max(0.06, 0.34 - i * 0.0028 - depth * 0.05);
        const size = 0.55 + (1 - i / dots.length) * 0.6;
        return <circle key={i} cx={x} cy={y} r={size} fill="white" fillOpacity={op} />;
      })}
    </svg>
  );
}

const visuals = [VisualSilence, VisualLines, VisualParticles];

/* ──────────────────────────────────────────────────────────
   CONTENT
   ────────────────────────────────────────────────────────── */

const chapters = [
  {
    number: 1,
    title: "The Weight of Silence",
    subtitle: "On stillness as a form of creation",
    paragraphs: [
      "There is a kind of silence that does not empty a room but fills it.",
      "A silence that arrives after the last word has been spoken and refuses to leave. In that silence, the reader and the text become indistinguishable — one borrowing breath from the other.",
    ],
  },
  {
    number: 2,
    title: "Lines Without Edges",
    subtitle: "How we perceive the boundary between thought and form",
    paragraphs: [
      "Every mark made on a surface carries within it the ghost of every mark that came before.",
      "The artist does not begin with a blank canvas — they begin with the accumulated weight of every image they have ever seen. The blank is an illusion.",
    ],
  },
  {
    number: 3,
    title: "The Reader as Author",
    subtitle: "Meaning as a collaborative act",
    paragraphs: [
      "A book unread is not a book at all. It is a collection of potential meanings held in suspension.",
      "Waiting for a consciousness to collapse the waveform into something specific. You, in reading this, have made it real. Before you, it was only possible.",
    ],
  },
];

const INTRO_COUNT = 2;
const TOTAL = INTRO_COUNT + chapters.length;
const SNAP_DURATION = 1400;

export default function Book() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const [isAnimating, setIsAnimating] = useState(false);
  const [depth, setDepth] = useState(0);
  const [inputValues, setInputValues] = useState<string[]>(chapters.map(() => ""));

  const lastScrollTime = useRef(0);
  const animatingRef = useRef(false);
  const depthRef = useRef(0);
  const lastWheelRef = useRef(0);

  /* ── Snap navigation ─────────────────────────────────── */
  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOTAL) return;
      if (animatingRef.current) return;
      animatingRef.current = true;
      setIsAnimating(true);
      setDirection(index > activeIndex ? "down" : "up");
      setPrevIndex(activeIndex);
      setActiveIndex(index);
      setTimeout(() => {
        setPrevIndex(null);
        setIsAnimating(false);
        animatingRef.current = false;
      }, SNAP_DURATION);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex]
  );

  /* ── Wheel: snap + nudge depth ──────────────────────── */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      // Always nudge depth a little — scrolling = sinking deeper
      depthRef.current = Math.min(1, depthRef.current + Math.abs(e.deltaY) * 0.0009);
      lastWheelRef.current = now;
      if (now - lastScrollTime.current < SNAP_DURATION + 60) return;
      if (Math.abs(e.deltaY) < 25) return;
      lastScrollTime.current = now;
      goTo(e.deltaY > 0 ? activeIndex + 1 : activeIndex - 1);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIndex, goTo]);

  /* ── Keyboard ───────────────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, goTo]);

  /* ── Touch ──────────────────────────────────────────── */
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.touches[0].clientY;
    depthRef.current = Math.min(1, depthRef.current + Math.abs(diff) * 0.0008);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? activeIndex + 1 : activeIndex - 1);
  };

  /* ── Depth: ambient breathing + scroll input + decay ── */
  useEffect(() => {
    depthRef.current = 0;
    setDepth(0);
    const start = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const elapsed = (t - start) / 1000;
      // ambient: rises 0 → ~0.45 over ~6s, then breathes
      const ambient =
        Math.min(0.42, elapsed * 0.07) +
        Math.sin(elapsed * 0.45) * 0.045;
      // decay scroll-induced depth slowly so user can re-trigger
      const sinceWheel = (Date.now() - lastWheelRef.current) / 1000;
      if (sinceWheel > 0.4) {
        depthRef.current = Math.max(0, depthRef.current - 0.004);
      }
      const target = Math.min(1, ambient + depthRef.current);
      setDepth(target);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  /* ── Slide class ────────────────────────────────────── */
  const slideClass = (i: number) => {
    if (i === activeIndex) return "slide-active";
    if (i === prevIndex && isAnimating)
      return direction === "down" ? "slide-exit-up" : "slide-exit-down";
    return i < activeIndex ? "slide-above" : "slide-below";
  };

  const chapterIndex = activeIndex - INTRO_COUNT;

  return (
    <div
      className="book-root"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ ["--depth" as string]: depth.toFixed(3) }}
    >
      {/* ── Section 0: Title page ─────────────────────────── */}
      <section className={`book-section book-section--cover ${slideClass(0)}`}>
        <div className="cover-inner">
          <p className="cover-eyebrow">A Reading Experience</p>
          <h1 className="cover-title">The Book<br />of Silences</h1>
          <p className="cover-subtitle">Three meditations on perception,<br />form, and the act of reading</p>
          <div className="cover-symbol" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="15.5" y="1" width="1" height="30" fill="white" fillOpacity="0.45" />
              <rect x="1" y="15.5" width="30" height="1" fill="white" fillOpacity="0.45" />
              <circle cx="16" cy="16" r="5.5" stroke="white" strokeOpacity="0.45" strokeWidth="1" />
            </svg>
          </div>
          <p className="cover-scroll-hint">scroll to begin</p>
        </div>
      </section>

      {/* ── Section 1: Quote / intro page ────────────────── */}
      <section className={`book-section book-section--quote ${slideClass(1)}`}>
        <div className="quote-inner">
          <p className="quote-label">Preface</p>
          <blockquote className="quote-text">
            "The page is not a surface to be covered.<br />
            It is a space to be inhabited —<br />
            slowly, and with full attention."
          </blockquote>
          <p className="quote-attribution">— on the nature of reading</p>
        </div>
      </section>

      {/* ── Sections 2–4: Chapters ───────────────────────── */}
      {chapters.map((ch, i) => {
        const globalIndex = INTRO_COUNT + i;
        const Visual = visuals[i];
        const isActive = globalIndex === activeIndex;
        return (
          <section
            key={ch.number}
            className={`book-section book-section--chapter ${slideClass(globalIndex)}`}
          >
            {/* Canvas — LEFT 60% */}
            <div className="chapter-canvas">
              <div
                className="chapter-canvas-inner"
                style={{
                  ["--depth" as string]: isActive ? depth.toFixed(3) : "0",
                }}
              >
                <Visual depth={isActive ? depth : 0} />
              </div>
            </div>

            {/* Text — RIGHT 40% */}
            <div className="chapter-text">
              <div className="chapter-text-inner">
                <div className="chapter-label">Chapter {String(ch.number).padStart(2, "0")}</div>
                <h2 className="chapter-title">{ch.title}</h2>
                <p className="chapter-subtitle">{ch.subtitle}</p>
                <div className="chapter-body">
                  {ch.paragraphs.map((p, pi) => (
                    <p key={pi}>{p}</p>
                  ))}
                </div>
                <div className="chapter-input-wrapper">
                  <input
                    className="chapter-input"
                    type="text"
                    placeholder="Modify the experience..."
                    value={inputValues[i]}
                    onChange={(e) => {
                      const next = [...inputValues];
                      next[i] = e.target.value;
                      setInputValues(next);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Margin sidebar (chapters only) ────────────────── */}
      {chapterIndex >= 0 && (
        <nav className="chapter-margin" aria-label="Chapters">
          <ul className="chapter-margin-list">
            {chapters.map((ch, i) => (
              <li key={ch.number} className="chapter-margin-li">
                <button
                  type="button"
                  onClick={() => goTo(INTRO_COUNT + i)}
                  className={`chapter-margin-item ${i === chapterIndex ? "chapter-margin-item--active" : ""}`}
                  aria-label={`Go to chapter ${ch.number}`}
                  aria-current={i === chapterIndex ? "true" : undefined}
                >
                  {String(ch.number).padStart(2, "0")}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* ── Subtle global progress (chapters only) ────────── */}
      {chapterIndex >= 0 && (
        <div className="global-progress" aria-hidden="true">
          {String(chapterIndex + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
        </div>
      )}
    </div>
  );
}
