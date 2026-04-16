"use client";

import { useState, useEffect } from "react";

function getTimeUntilCutoff(): { hours: number; minutes: number; seconds: number; isPastCutoff: boolean } {
  const now = new Date();
  const aestOffset = 10 * 60;
  const localOffset = now.getTimezoneOffset();
  const aestTime = new Date(now.getTime() + (aestOffset + localOffset) * 60 * 1000);

  const cutoffHour = 14; // 2 PM AEST
  const currentHour = aestTime.getHours();
  const currentMinute = aestTime.getMinutes();
  const currentSecond = aestTime.getSeconds();

  if (currentHour >= cutoffHour) {
    return { hours: 0, minutes: 0, seconds: 0, isPastCutoff: true };
  }

  const totalSecondsRemaining =
    (cutoffHour - currentHour - 1) * 3600 +
    (59 - currentMinute) * 60 +
    (60 - currentSecond);

  return {
    hours: Math.floor(totalSecondsRemaining / 3600),
    minutes: Math.floor((totalSecondsRemaining % 3600) / 60),
    seconds: totalSecondsRemaining % 60,
    isPastCutoff: false,
  };
}

export function DispatchCountdown() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(getTimeUntilCutoff);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(getTimeUntilCutoff());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 border-y border-white/5 bg-smoke/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!mounted ? (
          <p className="text-center text-cream/90 text-xs tracking-widest uppercase">
            Same-day dispatch on orders before 2:00 PM AEST
          </p>
        ) : time.isPastCutoff ? (
          <div className="text-center">
            <p className="text-cream/80 text-sm">
              Today&apos;s dispatch window has closed.
            </p>
            <p className="text-cream/85 text-xs mt-1">
              Orders placed now will be freshly poured and dispatched next business day.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {/* Label */}
            <div className="text-center sm:text-right">
              <p className="text-gold text-[10px] tracking-[0.3em] uppercase">
                Order before
              </p>
              <p className="font-serif text-cream text-lg leading-tight">2 PM AEST</p>
              <p className="text-cream/85 text-[10px] tracking-wider uppercase">
                same-day dispatch
              </p>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-10 bg-white/10" />

            {/* Timer */}
            <div className="flex items-center gap-2 sm:gap-3">
              <TimeBlock value={time.hours} label="Hrs" />
              <span className="text-gold/40 text-lg font-light mb-3">:</span>
              <TimeBlock value={time.minutes} label="Min" />
              <span className="text-gold/40 text-lg font-light mb-3">:</span>
              <TimeBlock value={time.seconds} label="Sec" />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-10 bg-white/10" />

            {/* Tagline */}
            <div className="text-center sm:text-left hidden sm:block">
              <p className="text-cream/80 text-xs leading-relaxed max-w-[140px]">
                Freshly poured &amp; shipped the same day
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-smoke border border-white/8 flex items-center justify-center">
        <span className="font-serif text-xl sm:text-2xl text-cream">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] text-cream/55 uppercase tracking-wider mt-1.5">
        {label}
      </span>
    </div>
  );
}
