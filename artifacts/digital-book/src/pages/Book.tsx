import { useRef, useState, useEffect, useCallback } from "react";
import "@/styles/book.css";

const chapters = [
  {
    number: 1,
    title: "The Weight of Silence",
    subtitle: "On stillness as a form of creation",
    body: "There is a kind of silence that does not empty a room but fills it. A silence that arrives after the last word has been spoken and refuses to leave. In that silence, the reader and the text become indistinguishable — one borrowing breath from the other.",
    canvasLabel: "I.",
  },
  {
    number: 2,
    title: "Lines Without Edges",
    subtitle: "How we perceive the boundary between thought and form",
    body: "Every mark made on a surface carries within it the ghost of every mark that came before. The artist does not begin with a blank canvas — they begin with the accumulated weight of every image they have ever seen. The blank is an illusion.",
    canvasLabel: "II.",
  },
  {
    number: 3,
    title: "The Reader as Author",
    subtitle: "Meaning as a collaborative act",
    body: "A book unread is not a book at all. It is a collection of potential meanings held in suspension, waiting for a consciousness to collapse the waveform into something specific. You, in reading this, have made it real. Before you, it was only possible.",
    canvasLabel: "III.",
  },
];

const INTRO_COUNT = 2;
const TOTAL = INTRO_COUNT + chapters.length;

export default function Book() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValues, setInputValues] = useState<string[]>(
    chapters.map(() => "")
  );
  const lastScrollTime = useRef(0);
  const animatingRef = useRef(false);

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
      }, 950);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex]
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 980) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 25) return;
      e.preventDefault();
      lastScrollTime.current = now;
      goTo(e.deltaY > 0 ? activeIndex + 1 : activeIndex - 1);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIndex, goTo]);

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

  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? activeIndex + 1 : activeIndex - 1);
  };

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
      onTouchEnd={handleTouchEnd}
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
        return (
          <section
            key={ch.number}
            className={`book-section book-section--chapter ${slideClass(globalIndex)}`}
          >
            {/* Canvas — LEFT 60% */}
            <div className="chapter-canvas">
              <div className="chapter-canvas-inner">
                <span className="chapter-canvas-glyph">{ch.canvasLabel}</span>
              </div>
            </div>

            {/* Text — RIGHT 40% */}
            <div className="chapter-text">
              <div className="chapter-text-inner">
                <div className="chapter-progress">
                  {ch.number} / {chapters.length}
                </div>
                <div className="chapter-label">Chapter {ch.number}</div>
                <h2 className="chapter-title">{ch.title}</h2>
                <p className="chapter-subtitle">{ch.subtitle}</p>
                <p className="chapter-body">{ch.body}</p>
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

      {/* ── Subtle global progress (chapters only) ────────── */}
      {chapterIndex >= 0 && (
        <div className="global-progress" aria-hidden="true">
          {chapterIndex + 1} / {chapters.length}
        </div>
      )}
    </div>
  );
}
