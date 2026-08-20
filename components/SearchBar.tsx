"use client";

import { Search, ArrowRight, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <label htmlFor="match-search" className="sr-only">
        Search matches by team or series
      </label>
      <div className="relative flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md focus-within:bg-black/60 focus-within:border-white/30 transition-all">
        <Search className="w-5 h-5 text-chalk/50 ml-2" />
        <input
          id="match-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search a team or series — e.g. Pakistan, T20 World Cup"
          className="flex-1 bg-transparent px-4 py-2 text-chalk placeholder:text-chalk/40 font-body text-sm sm:text-base focus:outline-none"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="text-chalk/50 hover:text-chalk mr-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          className="bg-green-600 hover:bg-green-500 text-white rounded-full p-2 flex items-center justify-center transition-colors"
          aria-label="Submit search"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
