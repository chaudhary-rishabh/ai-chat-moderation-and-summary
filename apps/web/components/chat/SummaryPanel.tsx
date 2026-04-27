"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/stores/uiStore";
import { useChatStore } from "@/stores/chatStore";
import { aiApi } from "@/lib/api/ai.api";
import { Compass, X, Loader2, Sparkles, ChevronRight } from "lucide-react";

export function SummaryPanel() {
  const setPanelMode = useUIStore((s) => s.setPanelMode);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const [lang, setLang] = useState("en");
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["summary", activeRoomId, lang],
    queryFn: () => aiApi.getSummary(activeRoomId!, lang),
    enabled: enabled && !!activeRoomId,
  });

  const generate = useCallback(() => {
    setEnabled(true);
    refetch();
  }, [refetch]);

  let parsed: Record<string, string[]> | null = null;
  if (data?.content) {
    try {
      parsed = JSON.parse(data.content) as Record<string, string[]>;
    } catch {
      parsed = null;
    }
  }

  const mainPoints = parsed?.mainPoints ?? [];
  const decisions = parsed?.decisions ?? [];
  const actionItems = parsed?.actionItems ?? [];
  const unresolvedQuestions = parsed?.unresolvedQuestions ?? [];
  const participants = parsed?.participants ?? [];

  return (
    <div className="w-80 h-full glass-strong rounded-l-3xl flex flex-col shrink-0 border-l border-white/10">
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-summary-accent" />
          <span className="text-sm font-semibold text-ink">Summary</span>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="glass-soft rounded-lg px-2 py-1 text-xs text-ink outline-none"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
            <option value="de">DE</option>
            <option value="hi">HI</option>
          </select>
          <button
            onClick={() => setPanelMode("chat")}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4 text-ink-soft" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!enabled && (
          <div className="text-center text-ink-faint text-sm mt-8">
            <Compass className="w-8 h-8 mx-auto mb-2 text-summary-accent/40" />
            <p className="mb-3">Get a quick summary of this conversation</p>
            <button
              onClick={generate}
              className="glass rounded-xl px-4 py-2 text-sm text-summary-accent hover:bg-white/15 transition"
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              Generate Summary
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-summary-accent" />
            <span className="ml-2 text-sm text-ink-soft">Summarizing...</span>
          </div>
        )}

        {error && (
          <div className="text-center text-danger text-sm py-4">
            Could not generate summary. Try again.
            <button
              onClick={generate}
              className="block mx-auto mt-2 text-summary-accent hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {parsed && (
          <div className="space-y-4">
            {mainPoints.length > 0 && (
              <Section title="Main Points" items={mainPoints} />
            )}
            {decisions.length > 0 && (
              <Section title="Decisions" items={decisions} />
            )}
            {actionItems.length > 0 && (
              <Section title="Action Items" items={actionItems} />
            )}
            {unresolvedQuestions.length > 0 && (
              <Section title="Open Questions" items={unresolvedQuestions} />
            )}
            {participants.length > 0 && (
              <div className="glass-soft rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-ink-soft mb-1">Participants</p>
                <div className="flex flex-wrap gap-1">
                  {participants.map((p, i) => (
                    <span key={i} className="text-xs glass rounded-full px-2 py-0.5 text-ink">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data?.citations?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-soft mb-1.5">Sources</p>
                {data.citations.map((c: { messageId: string; senderName: string; snippet: string }, i: number) => (
                  <div key={i} className="glass-soft rounded-lg px-3 py-1.5 mb-1 text-xs text-ink-soft">
                    <span className="font-medium text-ink">{c.senderName}</span>:{" "}
                    {c.snippet.slice(0, 100)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-soft mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-sm text-ink">
            <ChevronRight className="w-3.5 h-3.5 text-ink-faint mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
