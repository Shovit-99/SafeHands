import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  suffix?: string;
  trend?: { value: string; isUp: boolean };
  sparklineData?: number[];
  delay?: number;
}

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 80;
  const height = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} className="sparkline" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkGrad-${color.replace('#', '')})`} className="sparkline-area" />
      <path d={linePath} stroke={color} className="sparkline-line" />
    </svg>
  );
};

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  suffix = '',
  trend,
  sparklineData,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 1200;
    const startTime = performance.now();
    const startDelay = delay;

    const timer = setTimeout(() => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime - startDelay;
        if (elapsed < 0) {
          requestAnimationFrame(animate);
          return;
        }
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [hasAnimated, value, delay]);

  return (
    <div
      ref={ref}
      className="stat-card animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
      id={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="stat-icon" style={{ background: iconBg }}>
          <Icon size={22} style={{ color: iconColor }} />
        </div>
        {sparklineData && (
          <Sparkline data={sparklineData} color={iconColor} />
        )}
      </div>

      <p style={{
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'var(--text-tertiary)',
        marginBottom: '0.375rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </p>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
        <span className="stat-number">
          {displayValue}{suffix}
        </span>
        {trend && (
          <span className={`stat-trend ${trend.isUp ? 'stat-trend-up' : 'stat-trend-down'}`}>
            {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
