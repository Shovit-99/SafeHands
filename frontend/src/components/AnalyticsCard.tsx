import React, { useState, useEffect, useRef } from 'react';

interface ChartData {
  lost: number;
  found: number;
  claimed: number;
}

interface AnalyticsCardProps {
  data?: ChartData;
}

const WEEKLY_DATA = [
  { day: 'Mon', value: 4 },
  { day: 'Tue', value: 7 },
  { day: 'Wed', value: 3 },
  { day: 'Thu', value: 8 },
  { day: 'Fri', value: 6 },
  { day: 'Sat', value: 5 },
  { day: 'Sun', value: 9 },
];

const PieChart: React.FC<{ data: ChartData; animated: boolean }> = ({ data, animated }) => {
  const total = data.lost + data.found + data.claimed;
  if (total === 0) return null;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { value: data.lost, color: '#EF4444', label: 'Lost' },
    { value: data.found, color: '#0088FF', label: 'Found' },
    { value: data.claimed, color: '#3B82F6', label: 'Claimed' },
  ];

  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <svg width="88" height="88" viewBox="0 0 88 88" className="pie-chart">
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dashLength = pct * circumference;
          const dashOffset = animated ? -offset : circumference;
          offset += dashLength;
          return (
            <circle
              key={seg.label}
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              style={{
                transition: animated ? 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none',
              }}
            />
          );
        })}
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: seg.color,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {seg.label}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 700, marginLeft: 'auto' }}>
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart: React.FC<{ animated: boolean }> = ({ animated }) => {
  const max = Math.max(...WEEKLY_DATA.map((d) => d.value));

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem', height: 64 }}>
      {WEEKLY_DATA.map((d, i) => (
        <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.375rem' }}>
          <div
            style={{
              width: '100%',
              maxWidth: 24,
              height: animated ? `${(d.value / max) * 48}px` : '0px',
              background: i === WEEKLY_DATA.length - 1
                ? 'var(--accent-gradient)'
                : 'rgba(0, 136, 255, 0.3)',
              borderRadius: '3px 3px 0 0',
              transition: `height 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s`,
            }}
          />
          <span style={{
            fontSize: '0.5625rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
};

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  data = { lost: 8, found: 16, claimed: 12 },
}) => {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAnimated(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="card" style={{ padding: '1.25rem' }}>
      <h3 style={{
        fontSize: '0.9375rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
      }}>
        Analytics
      </h3>

      {/* Pie Chart */}
      <PieChart data={data} animated={animated} />

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'var(--border-subtle)',
        margin: '1rem 0',
      }} />

      {/* Weekly bar chart */}
      <p style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        This Week
      </p>
      <BarChart animated={animated} />
    </div>
  );
};

export default AnalyticsCard;
