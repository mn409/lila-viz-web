'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  max: number;
  value: number;
  // Updated to allow both a number OR a function (like setStates do)
  onChange: (v: number | ((prev: number) => number)) => void;
}

export default function TimelineSlider({ max, value, onChange }: Props) {
  const [playing, setPlaying] = useState(false);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      raf.current = setInterval(() => {
        // This now works because the interface above allows the function syntax
        onChange((prev: number) => {
          if (prev >= max) {
            setPlaying(false);
            return max;
          }
          return prev + 1;
        });
      }, 50);
    } else {
      if (raf.current) clearInterval(raf.current);
    }
    return () => {
      if (raf.current) clearInterval(raf.current);
    };
  }, [playing, max, onChange]);

  const pct = max > 0 ? ((value / max) * 100).toFixed(1) : '0.0';

  return (
    <div className="timeline-bar">
      <label>TIMELINE</label>
      <button
        className="play-btn"
        onClick={() => {
          if (value >= max) onChange(0);
          setPlaying(p => !p);
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={e => {
          setPlaying(false);
          onChange(Number(e.target.value));
        }}
      />
      <span className="timeline-pct">{pct}%</span>
    </div>
  );
}