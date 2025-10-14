import React, { useEffect, useRef } from "react";

interface HexProgressProps {
  progress: number; // 0..1
  label?: string;
  src?: string;
}

export function HexProgress({ progress, label, src }: HexProgressProps) {
  const polyRef = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    if (polyRef.current) {
      const len = polyRef.current.getTotalLength();
      polyRef.current.style.setProperty("--len", `${len}`);
    }
  }, []);

  return (
    <div
      className="hex-progress"
      style={{ ["--progress" as any]: progress } as React.CSSProperties}
    >
      <svg viewBox="0 0 100 100" className="hex-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="hexGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>

        {/* Fill polygon */}
        <polygon
          className="hex-fill"
          points="50,2 93,25 93,75 50,98 7,75 7,25"
        />

        {/* Static border */}
        <polygon
          className="hex-border-static"
          points="50,2 93,25 93,75 50,98 7,75 7,25"
          fill="none"
          stroke="var(--border-muted)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Animated border */}
        <polygon
          ref={polyRef}
          className="hex-border"
          points="50,2 93,25 93,75 50,98 7,75 7,25"
          stroke="url(#hexGradient)"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="hex-inner">
        {src && <img src={src} alt="Badge_icon" className="hex-icon" />}
        {label && <div className="hex-label">{label}</div>}
      </div>
    </div>
  );
}
