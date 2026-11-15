/**
 * Tile sparkline: shape only, no axes, no labels, no tooltip. It sits beside a
 * stat value that carries the number, so it stays recessive (2px line, single
 * hue, soft wash under it).
 */
export function Sparkline({
  values,
  stroke = "var(--series-1)",
  width = 104,
  height = 30,
  ariaLabel,
}: {
  values: number[];
  stroke?: string;
  width?: number;
  height?: number;
  ariaLabel?: string;
}) {
  if (values.length < 2) return null;

  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (values.length - 1);

  const points = values.map((value, index) => {
    const x = pad + index * stepX;
    const y = pad + (height - pad * 2) * (1 - (value - min) / span);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)} ${height - pad} L${pad} ${height - pad} Z`;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className="overflow-visible"
    >
      <path d={area} fill={stroke} fillOpacity={0.08} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill={stroke} stroke="var(--surface)" strokeWidth={2} />
    </svg>
  );
}
