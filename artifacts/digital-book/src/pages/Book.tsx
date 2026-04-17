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

  const goToChapter = useCallback((index: number) => {
    if (index < 0 || index >= chapters.length) return;
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
    }, 900);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Mouse wheel handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 950) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 25) return;
      e.preventDefault();
      lastScrollTime.current = now;
      if (e.deltaY > 0) {
        goToChapter(activeIndex + 1);
      } else {
        goToChapter(activeIndex - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIndex, goToChapter]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goToChapter(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToChapter(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, goToChapter]);

  // Touch handler
  const touchStartY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToChapter(activeIndex + 1);
      else goToChapter(activeIndex - 1);
    }
  };

  const getSlideClass = (index: number): string => {
    if (index === activeIndex) return "slide-active";
    if (index === prevIndex && isAnimating) {
      return direction === "down" ? "slide-exit-up" : "slide-exit-down";
    }
    if (index < activeIndex) return "slide-above";
    return "slide-below";
  };

  return (
    <div
      className="book-root"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {chapters.map((ch, i) => (
        <section
          key={ch.number}
          className={`book-section ${getSlideClass(i)}`}
        >
          <div className="book-left">
            <div className="book-left-inner">
              <div className="book-progress">
                {ch.number} / {chapters.length}
              </div>
              <div className="book-chapter-label">Chapter {ch.number}</div>
              <h1 className="book-title">{ch.title}</h1>
              <p className="book-subtitle">{ch.subtitle}</p>
              <p className="book-body">{ch.body}</p>
              <div className="book-input-wrapper">
                <input
                  className="book-input"
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

          <div className="book-right">
            <div className="book-canvas">
              <span className="book-canvas-glyph">{ch.canvasLabel}</span>
            </div>
          </div>
        </section>
      ))}

      <nav className="book-nav">
        {chapters.map((_, i) => (
          <button
            key={i}
            className={`book-nav-dot ${i === activeIndex ? "book-nav-dot--active" : ""}`}
            onClick={() => goToChapter(i)}
            aria-label={`Go to chapter ${i + 1}`}
          />
        ))}
      </nav>
    </div>
  );
}
