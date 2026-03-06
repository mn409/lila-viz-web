export interface GameEvent {
  user_id: string;
  match_id: string;
  map_id: string;
  date: string;
  player_type: 'human' | 'bot';
  event: EventType;
  px: number;
  py: number;
  ts_ms: number;
  seq: number;
}

export type EventType =
  | 'Position'
  | 'BotPosition'
  | 'Kill'
  | 'Killed'
  | 'BotKill'
  | 'BotKilled'
  | 'KilledByStorm'
  | 'Loot';

export type MapId = 'AmbroseValley' | 'GrandRift' | 'Lockdown';

export interface MapConfig {
  scale: number;
  ox: number;
  oz: number;
  minimap: string;
  imageExt: 'png' | 'jpg';
}

export interface FilterState {
  mapId: MapId;
  dates: string[];
  matchId: string;       // '' = all
  showHumans: boolean;
  showBots: boolean;
  activeEvents: Set<EventType>;
  heatmapMode: 'off' | 'density' | 'kills';
  timelineMax: number;
  timelineCurrent: number;
}

export interface Stats {
  total: number;
  kills: number;
  deaths: number;
  stormDeaths: number;
  loot: number;
  humanEvents: number;
  botEvents: number;
  humanPct: number;
}
