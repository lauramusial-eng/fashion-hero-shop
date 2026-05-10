"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { CloseIcon, SearchIcon } from "./icons";
import { products } from "@/data/products";
import {
  semanticSearch,
  SUGGESTED_QUERIES,
  type SearchResult,
} from "@/lib/semantic-search";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function productGradient(hex: string): string {
  return `radial-gradient(ellipse at 50% 60%, ${hex}33 0%, ${hex}11 40%, #ece9e2 70%)`;
}

/** Wrap matched terms in <mark> for highlighting */
function highlightText(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;

  const pattern = terms
    .filter((t) => t.length >= 3)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  if (!pattern) return text;

  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-transparent text-charcoal font-semibold not-italic"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// Fallback suggestions shown in "no results" state
const FALLBACK_SUGGESTIONS = ["Cloud Runner", "Trail Pacer", "Wool Walker"];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState(""); // debounced
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce input → query
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      setIsSearching(value.trim().length > 0);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setQuery(value);
        setIsSearching(false);
      }, 300);
    },
    []
  );

  // Run semantic search when debounced query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const found = semanticSearch(query, products, 6);
    setResults(found);
  }, [query]);

  // Modal open/close side effects
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      setInputValue("");
      setQuery("");
      setResults([]);
      setIsSearching(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showEmpty = !inputValue.trim();
  const showSearching = isSearching && inputValue.trim().length > 0;
  const showResults = !isSearching && query.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drop-down panel */}
      <div className="relative bg-white shadow-lg w-full">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-black/10 pb-3">
            <SearchIcon className="h-5 w-5 text-warm-gray flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Try &quot;boho wedding guest&quot; or &quot;casual summer under 300&quot;"
              className="flex-1 text-base text-charcoal placeholder:text-warm-gray/70 outline-none bg-transparent"
            />
            {inputValue && (
              <button
                onClick={() => handleInputChange("")}
                className="p-1 hover:opacity-60 transition-opacity text-warm-gray"
                aria-label="Clear search"
              >
                <CloseIcon />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:opacity-60 transition-opacity ml-1"
              aria-label="Close search"
            >
              <CloseIcon />
            </button>
          </div>

          {/* ── Empty state: suggested query chips ── */}
          {showEmpty && (
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-warm-gray mb-3">
                Suggested searches
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleInputChange(q)}
                    className="px-3 py-1.5 text-[13px] border border-border rounded-full text-charcoal hover:border-charcoal hover:bg-cream transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Searching skeleton ── */}
          {showSearching && (
            <div className="mt-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-2 rounded animate-pulse"
                >
                  <div className="w-14 h-14 flex-shrink-0 rounded bg-cream" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-cream rounded w-1/2" />
                    <div className="h-3 bg-cream rounded w-1/3" />
                  </div>
                  <div className="h-4 bg-cream rounded w-12" />
                </div>
              ))}
            </div>
          )}

          {/* ── Results ── */}
          {showResults && (
            <div className="mt-4">
              {!hasResults ? (
                /* No results state */
                <div className="py-4">
                  <p className="text-sm text-warm-gray mb-4">
                    No results for{" "}
                    <span className="text-charcoal font-medium">
                      &ldquo;{query}&rdquo;
                    </span>
                    . Try one of these:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FALLBACK_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleInputChange(s)}
                        className="px-3 py-1.5 text-[13px] border border-border rounded-full text-charcoal hover:border-charcoal hover:bg-cream transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Result list */
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-warm-gray mb-3">
                    {results.length} result{results.length !== 1 ? "s" : ""} for
                    &ldquo;{query}&rdquo;
                  </p>
                  {results.map(({ product, matchedTerms }) => {
                    const color = product.colors[0];
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-2 rounded hover:bg-cream transition-colors group"
                      >
                        {/* Colour swatch thumbnail */}
                        <div
                          className="w-14 h-14 flex-shrink-0 rounded flex items-center justify-center"
                          style={{ background: productGradient(color.hex) }}
                        >
                          <div className="relative w-3/5 h-2/5">
                            <div
                              className="absolute inset-0 rounded-[50%]"
                              style={{
                                background: `${color.hex}66`,
                                transform: "rotate(-8deg) scaleX(1.4)",
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-[12px] font-medium uppercase tracking-[0.5px] truncate">
                            {highlightText(product.name, matchedTerms)}
                          </h4>
                          <p className="text-[12px] text-warm-gray">
                            {color.name}
                          </p>
                          {/* Matched tags */}
                          {matchedTerms.length > 0 && (
                            <p className="text-[11px] text-warm-gray/70 mt-0.5 capitalize">
                              {matchedTerms.slice(0, 3).join(" · ")}
                            </p>
                          )}
                        </div>

                        <span className="text-[14px] font-medium text-charcoal">
                          {product.price} zl
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
