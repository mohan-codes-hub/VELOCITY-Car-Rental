
import React, { useEffect, useRef, useState } from "react";
import "./Story.css";

const heading = "BEYOND LIMITS";

function Story() {
  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      {
        threshold: 0.4
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`story-page ${isActive ? "is-active" : ""}`}
    >
      <div className="story-glow"></div>
      <div className="story-smoke smoke-one"></div>
      <div className="story-smoke smoke-two"></div>

      <div className="story-top-label">
        VELOCITY / THE ART OF DRIVING
      </div>

      <div className="story-content">
        <span className="story-small-title">
          NOT JUST A DRIVE
        </span>

        <h1 className="story-heading">
          {heading.split("").map((letter, index) => (
            <span
              key={index}
              className="story-letter"
              style={{
                "--i": index,
                "--random-x": `${((index * 37) % 7 - 3) * 100}px`,
                "--random-r": `${(index % 2 === 0 ? 1 : -1) * (index * 17 + 30)}deg`
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </span>
          ))}
        </h1>

        <div className="story-gold-line"></div>

        <p className="story-description">
          POWER IS NOTHING
          <span> WITHOUT CONTROL</span>
        </p>

        <div className="story-details">
          <span>PRECISION</span>
          <i></i>
          <span>PERFORMANCE</span>
          <i></i>
          <span>PASSION</span>
        </div>
      </div>

      <div className="story-bottom-label">
        THE VELOCITY EXPERIENCE
      </div>
    </section>
  );
}

export default Story;
