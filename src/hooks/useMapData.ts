'use client';

import { useState, useEffect } from 'react';
import type { GameEvent, MapId } from '@/lib/types';

interface UseMapDataResult {
  events: GameEvent[];
  loading: boolean;
  error: string | null;
}

const cache = new Map<MapId, GameEvent[]>();

export function useMapData(mapId: MapId): UseMapDataResult {
  const [events, setEvents]   = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(mapId)) {
      setEvents(cache.get(mapId)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/data/${mapId}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<GameEvent[]>;
      })
      .then(data => {
        cache.set(mapId, data);
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message ?? 'Failed to load data');
        setLoading(false);
      });
  }, [mapId]);

  return { events, loading, error };
}
