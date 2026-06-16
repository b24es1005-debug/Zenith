type ScoreBadgeProps = {
  score: number;
  category: string;
};

function getTone(score: number) {
  if (score >= 90) return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (score >= 75) return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  if (score >= 50) return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  if (score >= 25) return "border-rose-300/20 bg-rose-300/10 text-rose-100";
  return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
}

export function ScoreBadge({ score, category }: ScoreBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] ${getTone(score)}`}>
      {score} · {category}
    </span>
  );
}