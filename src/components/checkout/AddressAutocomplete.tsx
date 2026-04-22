"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";

export interface AddressSuggestion {
  displayName:  string;
  addressLine1: string;
  city:         string;
  state:        string;
  postcode:     string;
}

interface Props {
  value:    string;
  onChange: (value: string) => void;
  onBlur?:  () => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  error?:   string;
}

export function AddressAutocomplete({ value, onChange, onBlur, onSelect, error }: Props) {
  const id                            = useId();
  const listId                        = `${id}-list`;
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen]               = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetching, setFetching]       = useState(false);
  const [searched, setSearched]       = useState(false); // true once a search completed
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);
  const inputRef                      = useRef<HTMLInputElement>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 4) {
      setSuggestions([]); setOpen(false); setSearched(false); return;
    }
    setFetching(true);
    try {
      const res  = await fetch(`/api/address-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const list: AddressSuggestion[] = data.results ?? [];
      setSuggestions(list);
      setOpen(true);       // always open after search — even if empty (shows "not found" msg)
      setSearched(true);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]); setOpen(false);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 4) { setSuggestions([]); setOpen(false); setSearched(false); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, fetchSuggestions]);

  // ── Outside click ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Select ───────────────────────────────────────────────────────────────────
  const handleSelect = (s: AddressSuggestion) => {
    onChange(s.addressLine1);
    onSelect(s);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setSearched(false);
    inputRef.current?.blur();
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown")  { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); handleSelect(suggestions[activeIndex]); }
    else if (e.key === "Escape")    { setOpen(false); setActiveIndex(-1); }
  };

  const hasResults  = suggestions.length > 0;
  const showDropdown = open && searched;

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-mahogany/70 mb-2">
        Address Line 1
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          name="addressLine1"
          value={value}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          placeholder="Start typing your street address…"
          onKeyDown={handleKeyDown}
          onChange={(e) => { onChange(e.target.value); }}
          onBlur={onBlur}
          className={`w-full bg-white border rounded-md px-4 py-3 pr-10 text-sm text-mahogany
            placeholder:text-mahogany/30 focus:outline-none focus:ring-1 transition-all ${
              error
                ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20"
                : "border-mahogany/20 hover:border-mahogany/35 focus:border-gold focus:ring-gold/20"
            }`}
        />

        {/* Search / spinner icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {fetching ? (
            <span className="inline-block w-4 h-4 border border-gold/30 border-t-gold rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              className="w-4 h-4 text-mahogany/20">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {error}</p>
      )}

      {/* Hint */}
      {!error && value.length > 0 && value.length < 4 && (
        <p className="text-xs text-mahogany/30 mt-1.5">Keep typing to search…</p>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-mahogany/15 bg-ivory
            shadow-xl shadow-mahogany/10 overflow-hidden divide-y divide-mahogany/10"
        >
          {hasResults ? (
            <>
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors text-sm
                    ${i === activeIndex ? "bg-gold/10" : "hover:bg-mahogany/5"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${i === activeIndex ? "text-gold" : "text-mahogany/25"}`}>
                    <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0">
                    <p className="font-medium text-mahogany truncate">{s.addressLine1}</p>
                    <p className="text-xs text-mahogany/40 mt-0.5 truncate">
                      {[s.city, s.state, s.postcode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </li>
              ))}

              {/* Footer */}
              <li className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-mahogany/20">Powered by OpenStreetMap</span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setOpen(false); inputRef.current?.focus(); }}
                  className="text-xs text-gold/50 hover:text-gold transition-colors"
                >
                  Type manually ↵
                </button>
              </li>
            </>
          ) : (
            /* No results found */
            <li className="px-4 py-4">
              <p className="text-sm text-mahogany/50 mb-1">Address not found in our lookup.</p>
              <p className="text-xs text-mahogany/35 leading-5">
                Simply close this and type your full address manually —
                City&nbsp;/&nbsp;Suburb, State, and Postcode can be filled in below.
              </p>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  setSuggestions([]);
                  setSearched(false);
                  inputRef.current?.focus();
                }}
                className="mt-3 text-xs text-gold border border-gold/30 rounded px-3 py-1.5
                  hover:bg-gold/10 transition-colors"
              >
                Enter address manually
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
