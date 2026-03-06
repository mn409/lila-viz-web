'use client';

import { EVENT_STYLE, ALL_EVENT_TYPES } from '@/lib/constants';
import type { EventType } from '@/lib/types';

export default function Legend({ active }: { active: Set<EventType> }) {
  return (
    <div className="legend">
      {ALL_EVENT_TYPES.map(et => (
        <div
          key={et}
          className="legend-item"
          style={{ opacity: active.has(et) ? 1 : 0.3 }}
        >
          <div className="legend-dot" style={{ background: EVENT_STYLE[et].color }} />
          <span>{et}</span>
        </div>
      ))}
    </div>
  );
}
