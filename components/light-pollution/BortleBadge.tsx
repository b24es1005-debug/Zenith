type BortleBadgeProps = {
  bortleClass: number;
  label: string;
};

function getTone(bortleClass: number) {
  if (bortleClass <= 2) return "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";
  if (bortleClass <= 4) return "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";
  if (bortleClass <= 6) return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  if (bortleClass <= 8) return "border-rose-300/20 bg-rose-300/10 text-rose-100";
  return "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100";
}

export function BortleBadge({ bortleClass, label }: BortleBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] ${getTone(bortleClass)}`}>
      Bortle {bortleClass} · {label}
    </span>
  );
}