import type { EventType, MapId, MapConfig } from './types';

export const EVENT_STYLE: Record<EventType, { color: string; radius: number; alpha: number }> = {
  Position:      { color: '#4ab4ff', radius: 3,  alpha: 0.5 },
  BotPosition:   { color: '#888888', radius: 2,  alpha: 0.5 },
  Kill:          { color: '#ff3232', radius: 7,  alpha: 0.9 },
  Killed:        { color: '#ff9600', radius: 7,  alpha: 0.9 },
  BotKill:       { color: '#ffd700', radius: 5,  alpha: 0.9 },
  BotKilled:     { color: '#c864ff', radius: 5,  alpha: 0.9 },
  KilledByStorm: { color: '#00ffc8', radius: 8,  alpha: 0.9 },
  Loot:          { color: '#ffffff', radius: 3,  alpha: 0.9 },
};

export const ALL_EVENT_TYPES: EventType[] = [
  'Position', 'BotPosition', 'Kill', 'Killed',
  'BotKill', 'BotKilled', 'KilledByStorm', 'Loot',
];

export const MAP_CONFIGS: Record<MapId, MapConfig> = {
  AmbroseValley: { scale: 900,  ox: -370, oz: -473, minimap: 'AmbroseValley_Minimap', imageExt: 'png' },
  GrandRift:     { scale: 581,  ox: -290, oz: -290, minimap: 'GrandRift_Minimap',     imageExt: 'png' },
  Lockdown:      { scale: 1000, ox: -500, oz: -500, minimap: 'Lockdown_Minimap',      imageExt: 'jpg' },
};

export const ALL_MAPS: MapId[] = ['AmbroseValley', 'GrandRift', 'Lockdown'];

export const DATES = ['2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13', '2026-02-14'];
