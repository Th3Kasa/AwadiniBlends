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

  if (!mounted) {
    return (
      <section className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-cream/40 text-sm">
            Same-day dispatch available on orders placed before 2:00 PM AEST
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {time.isPastCutoff ? (
          <div>
            <p className="text-cream/50 text-sm">
              Today&apos;s dispatch window has closed.
            </p>
            <p className="text-cream/30 text-xs mt-1">
              Orders placed now will be freshly poured and dispatched next
              business day.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
              Next-Day Dispatch
            </p>
            <p className="text-cream/60 text-sm mb-4">
              Order within the next
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <TimeBlock value={time.hours} label="Hours" />
              <span className="text-gold/50 text-xl font-light">:</span>
              <TimeBlock value={time.minutes} label="Minutes" />
              <span className="text-gold/50 text-xl font-light">:</span>
              <TimeBlock value={time.seconds} label="Seconds" />
            </div>
            <p className="text-cream/30 text-xs mt-4">
              for same-day pour &amp; dispatch (2:00 PM AEST cutoff)
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-smoke/60 border border-white/5 flex items-center justify-center">
        <span className="font-serif text-2xl sm:text-3xl text-cream">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] text-cream/30 uppercase tracking-wider mt-2">
        {label}
      </span>
    </div>
  );
}
