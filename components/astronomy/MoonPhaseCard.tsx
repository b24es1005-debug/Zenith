type MoonPhaseCardProps = {
  moonPhaseName: string;
  moonIlluminationPct: number;
  moonrise: string;
  moonset: string;
  sunrise: string;
  sunset: string;
};

function AstronomicalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
      <dt className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
    </div>
  );
}

export function MoonPhaseCard({ moonPhaseName, moonIlluminationPct, moonrise, moonset, sunrise, sunset }: MoonPhaseCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Moon phase</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{moonPhaseName}</h3>
          <p className="mt-1 text-sm text-white/60">Moon illumination {moonIlluminationPct}%</p>
          <p className="mt-1 text-xs text-white/40">Times shown in UTC.</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AstronomicalMetric label="Moonrise" value={moonrise} />
          <AstronomicalMetric label="Moonset" value={moonset} />
          <AstronomicalMetric label="Sunrise" value={sunrise} />
          <AstronomicalMetric label="Sunset" value={sunset} />
        </dl>
      </div>
    </div>
  );
}
