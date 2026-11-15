import { cn } from "@/lib/utils";

/**
 * A legend is present whenever two or more series are plotted, so identity is
 * never carried by colour alone. Swatch carries the hue; the text stays in ink.
 */
export function ChartLegend({
  items,
  className,
}: {
  items: Array<{ name: string; color: string }>;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", className)}>
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-[2px]"
            style={{ background: item.color }}
          />
          {item.name}
        </li>
      ))}
    </ul>
  );
}
