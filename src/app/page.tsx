'use client';

import { useState, useMemo, useCallback } from 'react';
import { useMapData } from '@/hooks/useMapData';
import { ALL_EVENT_TYPES } from '@/lib/constants';
import type { FilterState, MapId, Stats } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import MapCanvas from '@/components/MapCanvas';
import StatsPanel from '@/components/StatsPanel';
import TimelineSlider from '@/components/TimelineSlider';
import LoadingOverlay from '@/components/LoadingOverlay';

const DEFAULT_FILTERS: FilterState = {
  mapId:           'AmbroseValley',
  dates:           [],
  matchId:         '',
  showHumans:      true,
  showBots:        true,
  activeEvents:    new Set(ALL_EVENT_TYPES),  // ALL on by default
  heatmapMode:     'off',
  timelineMax:     100,
  timelineCurrent: 100,
};

export default function Home() {
  const [filters, setFilters]     = useState<FilterState>(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebar] = useState(false);

  const { events, loading, error } = useMapData(filters.mapId);

  const timelineMax = useMemo(() => {
    if (!filters.matchId) return 100;
    let max = 0;
    for (const e of events) {
      if (e.match_id === filters.matchId && e.seq > max) max = e.seq;
    }
    return max || 100;
  }, [events, filters.matchId]);

  const patchFilters = useCallback((patch: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...patch }));
  }, []);

  // Live stats — count ALL visible events (no timeline filter for stats)
  const stats: Stats = useMemo(() => {
    const vis = events.filter(e => {
      if (!filters.showHumans && e.player_type === 'human') return false;
      if (!filters.showBots   && e.player_type === 'bot')   return false;
      if (!filters.activeEvents.has(e.event))               return false;
      if (filters.dates.length > 0 && !filters.dates.includes(e.date)) return false;
      if (filters.matchId && e.match_id !== filters.matchId) return false;
      return true;
    });

    const total       = vis.length;
    const kills       = vis.filter(e => e.event === 'Kill' || e.event === 'BotKill').length;
    // Deaths = Killed + BotKilled events
    const deaths      = vis.filter(e => e.event === 'Killed' || e.event === 'BotKilled').length;
    const stormDeaths = vis.filter(e => e.event === 'KilledByStorm').length;
    const loot        = vis.filter(e => e.event === 'Loot').length;
    const humanEvents = vis.filter(e => e.player_type === 'human').length;
    const botEvents   = vis.filter(e => e.player_type === 'bot').length;
    const humanPct    = total > 0 ? (humanEvents / total) * 100 : 0;

    return { total, kills, deaths, stormDeaths, loot, humanEvents, botEvents, humanPct };
  }, [events, filters]);

  const mapLabel: Record<MapId, string> = {
    AmbroseValley: 'Ambrose Valley',
    GrandRift:     'Grand Rift',
    Lockdown:      'Lockdown',
  };

  return (
    <div className="app-shell">
      <Sidebar
        filters={filters}
        allEvents={events}
        onFilters={patchFilters}
        isOpen={sidebarOpen}
      />

      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 15 }} onClick={() => setSidebar(false)} />
      )}

      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hamburger" onClick={() => setSidebar(o => !o)}>☰</button>
            <span className="topbar-title">
              <span>{mapLabel[filters.mapId]}</span>
              {filters.matchId && (
                <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 11, fontFamily: 'monospace' }}>
                  {filters.matchId}
                </span>
              )}
            </span>
          </div>
          <span className="topbar-count">
            <em>{stats.total.toLocaleString()}</em> events visible
            {loading && <span style={{ marginLeft: 8, color: 'var(--accent)' }}>⟳</span>}
          </span>
        </div>

        <div className="canvas-area">
          <MapCanvas events={events} filters={{ ...filters, timelineMax }} />
          {loading && <LoadingOverlay message={`Loading ${filters.mapId}…`} />}
          {error && (
            <div className="loading-overlay">
              <div style={{ fontSize: 32 }}>⚠️</div>
              <p style={{ color: '#ff3232' }}>{error}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Run <code>python preprocess_new.py</code> first
              </p>
            </div>
          )}
        </div>

        {filters.matchId && (
          <TimelineSlider
            max={timelineMax}
            value={filters.timelineCurrent}
            onChange={(v: number | ((prev: number) => number)) =>
              patchFilters({ timelineCurrent: typeof v === 'function' ? v(filters.timelineCurrent) : v })
            }
          />
        )}

        <StatsPanel stats={stats} />
      </div>
    </div>
  );
}
