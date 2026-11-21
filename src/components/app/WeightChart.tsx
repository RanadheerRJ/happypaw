import { useId } from 'react';

export interface WeightPoint {
  date: string;
  weight: number;
}

/** Tiny dependency-free sparkline with an accessible text summary. */
export function WeightChart({
  points,
  height = 132,
}: {
  points: WeightPoint[];
  height?: number;
}) {
  const gradientId = useId();

  if (points.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-forest/20 px-4 py-6 text-center text-sm text-charcoal-500">
        No weigh-ins yet. Add the first one to start the chart.
      </p>
    );
  }

  const width = 340;
  const padding = { top: 12, right: 12, bottom: 22, left: 30 };
  const values = points.map((point) => point.weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const coords = points.map((point, index) => {
    const x = padding.left + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
    const y = padding.top + innerH - ((point.weight - min) / span) * innerH;
    return { ...point, x, y };
  });

  const line = coords.map((coord) => `${coord.x},${coord.y}`).join(' ');
  const first = coords[0];
  const last = coords[coords.length - 1];
  const area = `${first.x},${padding.top + innerH} ${line} ${last.x},${padding.top + innerH}`;

  const summary =
    points.length === 1
      ? `One weigh-in: ${points[0].weight} kg on ${points[0].date}.`
      : `Weight from ${points[0].weight} kg on ${points[0].date} to ${
          points[points.length - 1].weight
        } kg on ${points[points.length - 1].date}.`;

  return (
    <figure className="rounded-2xl border border-forest/10 bg-white p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={summary}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(112 145 120)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(112 145 120)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((fraction) => {
          const y = padding.top + innerH * fraction;
          const value = max - span * fraction;
          return (
            <g key={fraction}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="rgb(26 60 46 / 0.08)"
                strokeWidth="1"
              />
              <text x={0} y={y + 4} fontSize="9" fill="rgb(70 78 72 / 0.6)">
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        <polygon points={area} fill={`url(#${gradientId})`} />
        <polyline
          points={line}
          fill="none"
          stroke="rgb(26 60 46)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((coord) => (
          <circle
            key={`${coord.date}-${coord.x}`}
            cx={coord.x}
            cy={coord.y}
            r="3"
            fill="rgb(247 243 234)"
            stroke="rgb(26 60 46)"
            strokeWidth="1.8"
          />
        ))}
        <text
          x={last.x}
          y={last.y - 8}
          textAnchor={last.x > width - 60 ? 'end' : 'middle'}
          fontSize="10"
          fontWeight="700"
          fill="rgb(26 60 46)"
        >
          {last.weight} kg
        </text>
        <text x={padding.left} y={height - 4} fontSize="9" fill="rgb(70 78 72 / 0.6)">
          {first.date}
        </text>
        <text
          x={width - padding.right}
          y={height - 4}
          textAnchor="end"
          fontSize="9"
          fill="rgb(70 78 72 / 0.6)"
        >
          {last.date}
        </text>
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
