/** Exposure data reads as a column of figures, the way a shooting log does. */
export function LogLine({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-3 border-t border-rebate/15 py-1.5">
      <dt className="rebate-type w-28 shrink-0 text-silver">{label}</dt>
      <dd className="font-data text-sm text-rebate">{value}</dd>
    </div>
  );
}
