"use client";

import { useId, useMemo, useState } from "react";
import { ChartLegend } from "@/components/charts/chart-legend";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatMoneyWhole, makeAxisFormatter } from "@/lib/format";
import { clamp, niceCeil, ticks } from "@/lib/scale";
import { useElementWidth } from "@/lib/use-element-width";

const SERIES_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];
const PAD = { top: 18, right: 58, bottom: 28, left: 48 };

export interface LinePoint {
  label: string;
  values: number[];
}

/**
 * Multi-series line chart on ONE value axis (both measures share a unit).
 * Crosshair + tooltip is the default read path; each series is direct-labelled
 * at its last point, so identity never rests on colour alone.
 */
export function LineChart({
  seriesNames,
  points,
  formatValue = formatMoneyWhole,
  height = 248,
}: {
  seriesNames: string[];
  points: LinePoint[];
  formatValue?: (value: number) => string;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const { ref, width } = useElementWidth();
  const titleId = useId();

  const geo = useMemo(() => {
    const max = niceCeil(Math.max(...points.flatMap((point) => point.values)));
    const plotW = Math.max(width - PAD.left - PAD.right, 80);
    const plotH = Math.max(height - PAD.top - PAD.bottom, 60);
    const stepX = plotW / Math.max(points.length - 1, 1);
    const x = (index: number) => PAD.left + index * stepX;
    const y = (value: number) => PAD.top + plotH * (1 - value / max);
    const labelEvery = stepX < 44 ? 2 : 1;

    const series = seriesNames.map((name, seriesIndex) => ({
      name,
      color: SERIES_COLORS[seriesIndex % SERIES_COLORS.length],
      line: points
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"}${x(index).toFixed(1)} ${y(point.values[seriesIndex]).toFixed(1)}`,
        )
        .join(" "),
      lastValue: points[points.length - 1].values[seriesIndex],
    }));

    return { max, stepX, x, y, series, labelEvery, axisTicks: ticks(max, 4), axisFormat: makeAxisFormatter(max) };
  }, [height, points, seriesNames, width]);

  function pickIndex(clientX: number, target: SVGSVGElement) {
    const rect = target.getBoundingClientRect();
    const raw = Math.round((clientX - rect.left - PAD.left) / geo.stepX);
    setActive(clamp(raw, 0, points.length - 1));
  }

  const activePoint = active === null ? null : points[active];

  return (
    <div className="flex flex-col gap-3">
      <ChartLegend items={geo.series.map(({ name, color }) => ({ name, color }))} />

      <div ref={ref} className="relative w-full overflow-hidden" style={{ height }}>
        {width > 0 ? (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="touch-none"
          role="img"
          aria-labelledby={titleId}
          tabIndex={0}
          onMouseMove={(event) => pickIndex(event.clientX, event.currentTarget)}
          onMouseLeave={() => setActive(null)}
          onTouchStart={(event) => pickIndex(event.touches[0].clientX, event.currentTarget)}
          onTouchMove={(event) => pickIndex(event.touches[0].clientX, event.currentTarget)}
          onFocus={() => setActive(points.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            setActive((current) =>
              clamp(
                (current ?? points.length - 1) + (event.key === "ArrowRight" ? 1 : -1),
                0,
                points.length - 1,
              ),
            );
          }}
        >
          <title id={titleId}>
            {seriesNames.join(" and ")} by period. Arrow keys step through periods.
          </title>

          {geo.axisTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={geo.y(tick)}
                y2={geo.y(tick)}
                stroke="var(--grid)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
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
            x1={PAD.left}
            x2={width - PAD.right}
            y1={geo.y(0)}
            y2={geo.y(0)}
            stroke="var(--axis)"
            strokeWidth={1}
          />

          {points.map((point, index) =>
            index % geo.labelEvery === 0 ? (
              <text
                key={point.label}
                x={geo.x(index)}
                y={height - 8}
                textAnchor="middle"
                fill="var(--ink-muted)"
                fontSize={10}
              >
                {point.label}
              </text>
            ) : null,
          )}

          {active !== null ? (
            <line
              x1={geo.x(active)}
              x2={geo.x(active)}
              y1={PAD.top}
              y2={geo.y(0)}
              stroke="var(--axis)"
              strokeWidth={1}
            />
          ) : null}

          {geo.series.map((series) => (
            <path
              key={series.name}
              d={series.line}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {active !== null
            ? geo.series.map((series, seriesIndex) => (
                <circle
                  key={series.name}
                  cx={geo.x(active)}
                  cy={geo.y(points[active].values[seriesIndex])}
                  r={4.5}
                  fill={series.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))
            : null}

          {geo.series.map((series) => (
            <text
              key={`end-${series.name}`}
              x={width - PAD.right + 8}
              y={geo.y(series.lastValue) + 3.5}
              fill="var(--ink-secondary)"
              fontSize={10}
              className="tnum"
            >
              {geo.axisFormat(series.lastValue)}
            </text>
          ))}
        </svg>
        ) : null}

        <ChartTooltip
          visible={activePoint !== null}
          title={activePoint?.label ?? ""}
          xPct={active === null || width === 0 ? 0 : (geo.x(active) / width) * 100}
          yPct={4}
          rows={
            activePoint
              ? geo.series.map((series, seriesIndex) => ({
                  name: series.name,
                  color: series.color,
                  value: formatValue(activePoint.values[seriesIndex]),
                }))
              : []
          }
        />
      </div>
    </div>
  );
}
