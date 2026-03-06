'use client';

import type { Stats } from '@/lib/types';

function fmt(n: number) {
  // Full number below 10k, abbreviated above
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 10_000)    return (n / 1_000).toFixed(1) + 'k';
  return n.toLocaleString();
}

export default function StatsPanel({ stats }: { stats: Stats }) {
  return (
    <div className="stats-panel">
      <div className="stat-card accent">
        <span className="stat-label">Total Events</span>
        <span className="stat-value">{fmt(stats.total)}</span>
      </div>
      <div className="stat-card red">
        <span className="stat-label">Kills</span>
        <span className="stat-value">{fmt(stats.kills)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Deaths</span>
        <span className="stat-value">{fmt(stats.deaths)}</span>
      </div>
      <div className="stat-card cyan">
        <span className="stat-label">Storm Deaths</span>
        <span className="stat-value">{fmt(stats.stormDeaths)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Loot</span>
        <span className="stat-value">{fmt(stats.loot)}</span>
      </div>
      <div className="stat-card green">
        <span className="stat-label">Human %</span>
        <span className="stat-value">{stats.humanPct.toFixed(1)}%</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Human Evts</span>
        <span className="stat-value">{fmt(stats.humanEvents)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Bot Evts</span>
        <span className="stat-value">{fmt(stats.botEvents)}</span>
      </div>
    </div>
  );
}
