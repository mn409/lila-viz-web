'use client';

import { useMemo, useState } from 'react';
import { ALL_MAPS, ALL_EVENT_TYPES, EVENT_STYLE, DATES } from '@/lib/constants';
import type { FilterState, MapId, EventType, GameEvent } from '@/lib/types';
import Legend from './Legend';

interface Props {
  filters: FilterState;
  allEvents: GameEvent[];
  onFilters: (patch: Partial<FilterState>) => void;
  isOpen: boolean;
}

export default function Sidebar({ filters, allEvents, onFilters, isOpen }: Props) {
  const [matchSearch, setMatchSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive unique matches for selected map+dates
  const matchOptions = useMemo(() => {
    const set = new Set<string>();
    for (const e of allEvents) {
      if (filters.dates.length === 0 || filters.dates.includes(e.date)) {
        set.add(e.match_id);
      }
    }
    return Array.from(set).sort();
  }, [allEvents, filters.dates]);

  const filteredMatches = useMemo(() => {
    if (!matchSearch) return matchOptions;
    return matchOptions.filter(m => m.toLowerCase().includes(matchSearch.toLowerCase()));
  }, [matchOptions, matchSearch]);

  const toggleDate = (d: string) => {
    const next = filters.dates.includes(d)
      ? filters.dates.filter(x => x !== d)
      : [...filters.dates, d];
    onFilters({ dates: next });
  };

  const toggleEvent = (et: EventType) => {
    const next = new Set(filters.activeEvents);
    if (next.has(et)) next.delete(et); else next.add(et);
    onFilters({ activeEvents: next });
  };

  const toggleAllEvents = (on: boolean) => {
    onFilters({ activeEvents: on ? new Set(ALL_EVENT_TYPES) : new Set() });
  };

  const selectedLabel = filters.matchId
    ? filters.matchId
    : 'All matches';

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <span style={{ fontSize: 22, lineHeight: 1 }}>🎮</span>
        <h1>LILA BLACK</h1>
        <span className="badge">APM</span>
      </div>

      {/* Map selector */}
      <div className="sidebar-section">
        <label className="section-title">Map</label>
        <div className="map-tabs">
          {ALL_MAPS.map(m => (
            <button
              key={m}
              className={`map-tab${filters.mapId === m ? ' active' : ''}`}
              onClick={() => onFilters({ mapId: m as MapId, matchId: '', dates: [] })}
            >
              {m === 'AmbroseValley' ? 'Ambrose' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="sidebar-section">
        <label className="section-title">Date</label>
        {DATES.map(d => (
          <label key={d} className="check-row">
            <input
              type="checkbox"
              checked={filters.dates.includes(d)}
              onChange={() => toggleDate(d)}
            />
            <span>{d.slice(5)}</span>
          </label>
        ))}
      </div>

      {/* Match — custom dropdown with full name + search */}
      <div className="sidebar-section">
        <label className="section-title">
          Match
          {filters.matchId && (
            <button
              onClick={() => onFilters({ matchId: '' })}
              style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11, cursor: 'pointer' }}
            >
              ✕ clear
            </button>
          )}
        </label>

        {/* Selected display — full name, wraps */}
        <div
          className="match-display"
          onClick={() => setDropdownOpen(o => !o)}
          title={selectedLabel}
        >
          <span className="match-display-text">{selectedLabel}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{dropdownOpen ? '▲' : '▼'}</span>
        </div>

        {dropdownOpen && (
          <div className="match-dropdown">
            <input
              className="match-search"
              placeholder="Search matches…"
              value={matchSearch}
              onChange={e => setMatchSearch(e.target.value)}
              autoFocus
            />
            <div className="match-list">
              <div
                className={`match-item${!filters.matchId ? ' active' : ''}`}
                onClick={() => { onFilters({ matchId: '' }); setDropdownOpen(false); setMatchSearch(''); }}
              >
                All matches
              </div>
              {filteredMatches.map(m => (
                <div
                  key={m}
                  className={`match-item${filters.matchId === m ? ' active' : ''}`}
                  onClick={() => { onFilters({ matchId: m }); setDropdownOpen(false); setMatchSearch(''); }}
                  title={m}
                >
                  {m}
                </div>
              ))}
              {filteredMatches.length === 0 && (
                <div style={{ padding: '8px', color: 'var(--text-muted)', fontSize: 11 }}>No matches found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Players */}
      <div className="sidebar-section">
        <label className="section-title">Players</label>
        <div className="toggle-row">
          <span>Show Humans</span>
          <label className="toggle">
            <input type="checkbox" checked={filters.showHumans} onChange={e => onFilters({ showHumans: e.target.checked })} />
            <span className="slider" />
          </label>
        </div>
        <div className="toggle-row" style={{ marginTop: 8 }}>
          <span>Show Bots</span>
          <label className="toggle">
            <input type="checkbox" checked={filters.showBots} onChange={e => onFilters({ showBots: e.target.checked })} />
            <span className="slider" />
          </label>
        </div>
      </div>

      {/* Event types */}
      <div className="sidebar-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <label className="section-title" style={{ marginBottom: 0 }}>Event Types</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 11, cursor: 'pointer' }} onClick={() => toggleAllEvents(true)}>All</button>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }} onClick={() => toggleAllEvents(false)}>None</button>
          </div>
        </div>
        {ALL_EVENT_TYPES.map(et => (
          <label key={et} className="check-row">
            <input type="checkbox" checked={filters.activeEvents.has(et)} onChange={() => toggleEvent(et)} />
            <span className="dot" style={{ background: EVENT_STYLE[et].color }} />
            <span>{et}</span>
          </label>
        ))}
      </div>

      {/* Heatmap mode */}
      <div className="sidebar-section">
        <label className="section-title">Heatmap</label>
        <div className="radio-group">
          {(['off', 'density', 'kills'] as const).map(mode => (
            <label key={mode} className="radio-row">
              <input type="radio" name="heatmap" checked={filters.heatmapMode === mode} onChange={() => onFilters({ heatmapMode: mode })} />
              <span>{mode === 'off' ? 'Off (dot mode)' : mode === 'density' ? 'Traffic density' : 'Kill locations'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="sidebar-section">
        <label className="section-title">Legend</label>
        <Legend active={filters.activeEvents} />
      </div>
    </aside>
  );
}
