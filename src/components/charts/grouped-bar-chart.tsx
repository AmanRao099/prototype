"use client";

import { useId, useMemo, useState } from "react";
import { ChartLegend } from "@/components/charts/chart-legend";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatMoneyWhole, makeAxisFormatter } from "@/lib/format";
import { niceCeil, ticks } from "@/lib/scale";
import { useElementWidth } from "@/lib/use-element-width";

const SERIES_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];
const PAD = { top: 14, right: 8, bottom: 26, left: 48 };
const NARROW = 440;
const PAD_NARROW = { top: 14, right: 6, bottom: 24, left: 34 };
const GROUP_GAP_RATIO = 0.52;
const BAR_GAP = 2; // surface gap between adjacent bars
const END_RADIUS = 4; // rounded data-end, anchored to the baseline

export interface BarGroup {
  label: string;
  values: number[];
}

/** Bar with a rounded top end and a square foot on the baseline. */
function barPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(END_RADIUS, w / 2, Math.max(h, 0));
  if (h <= 0.5) return "";
  return [
    `M${x} ${y + h}`,
    `V${y + r}`,
    `Q${x} ${y} ${x + r} ${y}`,
    `H${x + w - r}`,
    `Q${x + w} ${y} ${x + w} ${y + r}`,
    `V${y + h}`,
    "Z",
  ].join(" ");
}

export function GroupedBarChart({
  seriesNames,
  groups,
  formatValue = formatMoneyWhole,
  height = 236,
}: {
  seriesNames: string[];
  groups: BarGroup[];
  formatValue?: (value: number) => string;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const { ref, width } = useElementWidth();
  const titleId = useId();

  const geo = useMemo(() => {
    const pad = width > 0 && width < NARROW ? PAD_NARROW : PAD;
    const max = niceCeil(Math.max(...groups.flatMap((group) => group.values)));
    const plotW = Math.max(width - pad.left - pad.right, 80);
    const plotH = Math.max(height - pad.top - pad.bottom, 60);
    const slot = plotW / groups.length;
    const bandW = slot * (1 - GROUP_GAP_RATIO);
    const barW = Math.max((bandW - BAR_GAP * (seriesNames.length - 1)) / seriesNames.length, 3);
    const baseline = pad.top + plotH;
    const y = (value: number) => pad.top + plotH * (1 - value / max);
    const groupX = (index: number) => pad.left + slot * index + (slot - bandW) / 2;
    const labelEvery = Math.max(Math.ceil(40 / Math.max(slot, 1)), 1);

    return {
      max,
      pad,
      slot,
      bandW,
      barW,
      baseline,
      y,
      groupX,
      labelEvery,
      axisTicks: ticks(max, 4),
      axisFormat: makeAxisFormatter(max),
    };
  }, [groups, height, seriesNames.length, width]);

  const activeGroup = active === null ? null : groups[active];

  return (
    <div className="flex flex-col gap-3">
      <ChartLegend
        items={seriesNames.map((name, index) => ({
          name,
          color: SERIES_COLORS[index % SERIES_COLORS.length],
        }))}
      />

      <div ref={ref} className="relative w-full overflow-hidden" style={{ height }}>
        {width > 0 ? (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-labelledby={titleId}
          onMouseLeave={() => setActive(null)}
        >
          <title id={titleId}>{`${seriesNames.join(" and ")} by ${groups.map((group) => group.label).join(", ")}`}</title>

          {geo.axisTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={geo.pad.left}
                x2={width - geo.pad.right}
                y1={geo.y(tick)}
                y2={geo.y(tick)}
                stroke="var(--grid)"
                strokeWidth={1}
              />
              <text
                x={geo.pad.left - 8}
                y={geo.y(tick) + 3.5}
                textAnchor="end"
                className="tnum"
                fill="var(--ink-muted)"
                fontSize={10}
              >
                {geo.axisFormat(tick)}
              </text>
            </g>
          ))}

          <line
            x1={geo.pad.left}
            x2={width - geo.pad.right}
            y1={geo.baseline}
            y2={geo.baseline}
            stroke="var(--axis)"
            strokeWidth={1}
          />

          {groups.map((group, groupIndex) => {
            const x0 = geo.groupX(groupIndex);
            return (
              <g key={group.label}>
                {/* hover target spans the whole slot, bigger than the marks */}
                <rect
                  x={geo.pad.left + geo.slot * groupIndex}
                  y={geo.pad.top}
                  width={geo.slot}
                  height={geo.baseline - geo.pad.top}
                  fill={active === groupIndex ? "var(--surface-2)" : "transparent"}
                  onMouseEnter={() => setActive(groupIndex)}
                />
                {group.values.map((value, seriesIndex) => {
                  const x = x0 + seriesIndex * (geo.barW + BAR_GAP);
                  const y = geo.y(value);
                  return (
                    <path
                      key={seriesNames[seriesIndex]}
                      d={barPath(x, y, geo.barW, geo.baseline - y)}
                      fill={SERIES_COLORS[seriesIndex % SERIES_COLORS.length]}
                      opacity={active === null || active === groupIndex ? 1 : 0.55}
                      pointerEvents="none"
                    />
                  );
                })}
                <text
                  x={geo.pad.left + geo.slot * groupIndex + geo.slot / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fill="var(--ink-muted)"
                  fontSize={10}
                  pointerEvents="none"
                >
                  {group.label}
                </text>
              </g>
            );
          })}
        </svg>
        ) : null}

        <ChartTooltip
          visible={activeGroup !== null}
          title={activeGroup?.label ?? ""}
          xPct={
            active === null || width === 0
              ? 0
              : ((geo.pad.left + geo.slot * (active + 0.5)) / width) * 100
          }
          yPct={4}
          rows={
            activeGroup
              ? seriesNames.map((name, seriesIndex) => ({
                  name,
                  color: SERIES_COLORS[seriesIndex % SERIES_COLORS.length],
                  value: formatValue(activeGroup.values[seriesIndex]),
                }))
              : []
          }
        />
      </div>
    </div>
  );
}
