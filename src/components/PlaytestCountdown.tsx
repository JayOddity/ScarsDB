'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PLAYTEST_DATE = new Date('2026-04-30T00:00:00Z');

function getTimeLeft() {
  const now = Date.now();
  const diff = PLAYTEST_DATE.getTime() - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function BgImage() {
  return (
    <>
      <Image
        src="/images/steam-screenshot-1.avif"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/85" />
    </>
  );
}

export default function PlaytestCountdown() {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  // Reserve space before hydration to prevent CLS
  if (!mounted || !timeLeft) {
    return (
      <div className="block mb-10">
        <div className="relative overflow-hidden rounded-xl border border-honor-gold/20" style={{ minHeight: '132px' }}>
          <BgImage />
        </div>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  return (
    <Link href="/playtest" className="block mb-10 group">
      <div className="relative overflow-hidden rounded-xl border border-honor-gold/20 hover:border-honor-gold/40 transition-colors">
        <BgImage />

        {/* Content */}
        <div className="relative px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left text */}
          <div className="text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-honor-gold/70 mb-1">Steam Playtest</p>
            <h2 className="font-heading text-2xl sm:text-3xl text-white group-hover:text-honor-gold transition-colors">
              The Battle Awaits
            </h2>
            <p className="text-sm text-text-muted mt-1">April 30 - May 11, 2026</p>
          </div>

          {/* Countdown boxes */}
          <div className="flex items-center gap-3">
            {units.map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-3">
                <div className="text-center">
                  <div className="bg-black/60 border border-honor-gold/30 rounded-lg w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center backdrop-blur-sm">
                    <span className="font-heading text-2xl sm:text-4xl text-honor-gold tabular-nums">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-text-muted uppercase tracking-wider mt-1.5">{unit.label}</p>
                </div>
                {i < units.length - 1 && (
                  <span className="text-honor-gold/40 text-xl sm:text-2xl font-bold -mt-5">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
