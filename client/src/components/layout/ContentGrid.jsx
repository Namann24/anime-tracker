export default function ContentGrid({
  children,
  cols = { base: 1, md: 2, lg: 3, xl: 4 },
  gap = "gap-6",
}) {
  const cls = [
    "grid",
    gap,
    `grid-cols-${cols.base || 1}`,
    `md:grid-cols-${cols.md || 2}`,
    `lg:grid-cols-${cols.lg || 3}`,
    cols.xl ? `xl:grid-cols-${cols.xl}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={cls}>{children}</div>;
}
