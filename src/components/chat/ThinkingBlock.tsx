"use client";

import { useState, useEffect } from "react";
import { Brain, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingBlockProps {
  reasoning: string;
  isStreaming?: boolean;
}

export function ThinkingBlock({ reasoning, isStreaming = false }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(isStreaming);

  // Auto-expand when streaming starts, collapse when done
  useEffect(() => {
    if (isStreaming) setExpanded(true);
  }, [isStreaming]);

  return (
    <div className="mb-2 rounded-lg border border-indigo-200 bg-indigo-50 overflow-hidden">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-indigo-100 transition-colors"
      >
        {isStreaming ? (
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse flex-shrink-0" />
        ) : (
          <Brain className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
        )}
        <span className="text-xs font-medium text-indigo-700 flex-1">
          {isStreaming ? "Thinking..." : "Thought process"}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-indigo-400 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      {expanded && (
        <div className="px-3 pb-3 max-h-48 overflow-y-auto">
          <p className="text-xs text-indigo-800 font-mono whitespace-pre-wrap leading-relaxed">
            {reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
