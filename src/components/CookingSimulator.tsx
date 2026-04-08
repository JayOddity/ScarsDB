'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const SEGMENTS = [
  { label: 'Scorching', minPct: 85, maxPct: 100, color: '#dc2626' },
  { label: 'Hot', minPct: 65, maxPct: 85, color: '#ea580c' },
  { label: 'Warm', minPct: 45, maxPct: 65, color: '#eab308' },
  { label: 'Mild', minPct: 25, maxPct: 45, color: '#22c55e' },
  { label: 'Cool', minPct: 10, maxPct: 25, color: '#3b82f6' },
  { label: 'Cold', minPct: 0, maxPct: 10, color: '#6366f1' },
];

const HEAT_BUMP = 5;          // % added per E press
const COOL_DELAY = 5000;      // ms before cooling starts
const COOL_RATE = 0.08;       // % per frame when cooling

const BAR_WIDTH = 80;
const BAR_HEIGHT = 420;
const BAR_RADIUS = 16;

export default function CookingSimulator() {
  const [temp, setTemp] = useState(0);
  const lastHeatTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setTemp((prev) => {
      const now = Date.now();
      const elapsed = now - lastHeatTimeRef.current;

      // Cool down after delay
      if (elapsed > COOL_DELAY && prev > 0) {
        return Math.max(0, prev - COOL_RATE);
      }

      return prev;
    });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && !e.repeat) {
        e.preventDefault();
        lastHeatTimeRef.current = Date.now();
        setTemp((prev) => Math.min(100, prev + HEAT_BUMP));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Find current segment
  const currentSegment = SEGMENTS.find(
    (s) => temp >= s.minPct && temp < s.maxPct
  ) || SEGMENTS[SEGMENTS.length - 1];

  const tempLineY = BAR_HEIGHT - (temp / 100) * BAR_HEIGHT;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Main bar area */}
      <div className="flex items-end gap-6">
        {/* Segment labels (left side) */}
        <div className="relative" style={{ width: 80, height: BAR_HEIGHT }}>
          {SEGMENTS.map((seg) => {
            const top = BAR_HEIGHT - (seg.maxPct / 100) * BAR_HEIGHT;
            const height = ((seg.maxPct - seg.minPct) / 100) * BAR_HEIGHT;
            return (
              <div
                key={seg.label}
                className="absolute right-0 flex items-center justify-end pr-2 text-xs font-medium"
                style={{
                  top,
                  height,
                  color: seg.color,
                  opacity: currentSegment.label === seg.label ? 1 : 0.4,
                  transition: 'opacity 0.3s',
                }}
              >
                {seg.label}
              </div>
            );
          })}
        </div>

        {/* The temperature bar */}
        <div className="relative" style={{ width: BAR_WIDTH, height: BAR_HEIGHT }}>
          <svg width={BAR_WIDTH} height={BAR_HEIGHT} className="overflow-visible">
            {/* Background */}
            <rect
              x={0}
              y={0}
              width={BAR_WIDTH}
              height={BAR_HEIGHT}
              rx={BAR_RADIUS}
              ry={BAR_RADIUS}
              fill="#1a1a2e"
              stroke="#2a2a4a"
              strokeWidth={2}
            />

            {/* Clip path for rounded segments */}
            <defs>
              <clipPath id="bar-clip">
                <rect
                  x={0}
                  y={0}
                  width={BAR_WIDTH}
                  height={BAR_HEIGHT}
                  rx={BAR_RADIUS}
                  ry={BAR_RADIUS}
                />
              </clipPath>
            </defs>

            {/* Segments */}
            <g clipPath="url(#bar-clip)">
              {SEGMENTS.map((seg) => {
                const segTop = BAR_HEIGHT - (seg.maxPct / 100) * BAR_HEIGHT;
                const segHeight = ((seg.maxPct - seg.minPct) / 100) * BAR_HEIGHT;
                return (
                  <rect
                    key={seg.label}
                    x={0}
                    y={segTop}
                    width={BAR_WIDTH}
                    height={segHeight}
                    fill={seg.color}
                    opacity={0.15}
                  />
                );
              })}

              {/* Segment divider lines */}
              {SEGMENTS.slice(0, -1).map((seg) => {
                const y = BAR_HEIGHT - (seg.minPct / 100) * BAR_HEIGHT;
                return (
                  <line
                    key={`line-${seg.label}`}
                    x1={0}
                    x2={BAR_WIDTH}
                    y1={y}
                    y2={y}
                    stroke="#ffffff"
                    strokeOpacity={0.1}
                    strokeWidth={1}
                  />
                );
              })}

              {/* Fill up to current temp */}
              <rect
                x={0}
                y={tempLineY}
                width={BAR_WIDTH}
                height={BAR_HEIGHT - tempLineY}
                fill={currentSegment.color}
                opacity={0.3}
                style={{ transition: 'none' }}
              />
            </g>

            {/* Temperature indicator line */}
            <line
              x1={-6}
              x2={BAR_WIDTH + 6}
              y1={tempLineY}
              y2={tempLineY}
              stroke={currentSegment.color}
              strokeWidth={3}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${currentSegment.color})`,
              }}
            />

            {/* Small arrow markers on the line */}
            <polygon
              points={`-8,${tempLineY - 5} -8,${tempLineY + 5} -2,${tempLineY}`}
              fill={currentSegment.color}
            />
            <polygon
              points={`${BAR_WIDTH + 8},${tempLineY - 5} ${BAR_WIDTH + 8},${tempLineY + 5} ${BAR_WIDTH + 2},${tempLineY}`}
              fill={currentSegment.color}
            />

            {/* Border overlay */}
            <rect
              x={0}
              y={0}
              width={BAR_WIDTH}
              height={BAR_HEIGHT}
              rx={BAR_RADIUS}
              ry={BAR_RADIUS}
              fill="none"
              stroke="#3a3a5a"
              strokeWidth={2}
            />
          </svg>
        </div>

        {/* Temperature readout (right side) */}
        <div className="flex flex-col items-start gap-2" style={{ width: 80 }}>
          <div className="text-xs text-text-secondary uppercase tracking-wider">Temp</div>
          <div
            className="text-2xl font-bold font-mono tabular-nums"
            style={{ color: currentSegment.color }}
          >
            {Math.round(temp)}%
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: currentSegment.color }}
          >
            {currentSegment.label}
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="flex items-center gap-3 text-text-secondary text-sm">
        <kbd className="px-3 py-1.5 rounded border font-mono text-base bg-card-bg border-border-subtle">
          E
        </kbd>
        <span>Press to heat &middot; Cools after 5s</span>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          setTemp(0);
          lastHeatTimeRef.current = 0;
        }}
        className="px-4 py-2 text-sm bg-card-bg border border-border-subtle rounded hover:border-honor-gold/50 text-text-secondary hover:text-honor-gold transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
