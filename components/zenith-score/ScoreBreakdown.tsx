import type { ZenithScoreBreakdownItem } from "@/lib/zenith-score/zenith-score-types";

type ScoreBreakdownProps = {
  breakdown: ZenithScoreBreakdownItem[];
};

function BreakdownRow({ item }: { item: ZenithScoreBreakdownItem }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">{item.label}</div>
          <div className="text-xs text-white/45">{item.note}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-white">+{item.contribution}</div>
          <div className="text-xs text-white/45">weight {item.weight}%</div>
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300" style={{ width: `${item.componentScore}%` }} />
      </div>
    </div>
  );
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/55">Score Breakdown</h3>
        <span className="text-xs text-white/40">Weighted contributions</span>
      </div>
      <div className="space-y-3">
        {breakdown.map((item) => (
          <BreakdownRow key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}