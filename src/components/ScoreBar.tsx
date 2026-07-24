export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-rose-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
