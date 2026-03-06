'use client';

import { useRef, useEffect, useCallback } from 'react';
import { EVENT_STYLE } from '@/lib/constants';
import { buildHeatmap } from '@/lib/heatmap';
import type { GameEvent, FilterState } from '@/lib/types';

const IMAGE_SIZE = 1024;

interface Props {
  events: GameEvent[];
  filters: FilterState;
}

export default function MapCanvas({ events, filters }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const minimapRef   = useRef<HTMLImageElement | null>(null);
  const lastMapRef   = useRef<string>('');

  // Load minimap image whenever map changes
  useEffect(() => {
    const ext = filters.mapId === 'Lockdown' ? 'jpg' : 'png';
    const src = `/minimaps/${filters.mapId}_Minimap.${ext}`;
    if (lastMapRef.current === src) return;
    lastMapRef.current = src;

    const img = new Image();
    img.onload  = () => { minimapRef.current = img; draw(); };
    img.onerror = () => { minimapRef.current = null; draw(); };
    img.src = src;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.mapId]);

  // Filter events
  const visible = useCallback(() => {
    return events.filter(e => {
      if (!filters.showHumans && e.player_type === 'human') return false;
      if (!filters.showBots   && e.player_type === 'bot')   return false;
      if (!filters.activeEvents.has(e.event))               return false;
      if (filters.dates.length > 0 && !filters.dates.includes(e.date)) return false;
      if (filters.matchId && e.match_id !== filters.matchId)           return false;
      if (filters.timelineCurrent < filters.timelineMax && e.seq > filters.timelineCurrent) return false;
      return true;
    });
  }, [events, filters]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;
    if (!W || !H) return;

    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Draw minimap scaled to fit
    const scale = Math.min(W / IMAGE_SIZE, H / IMAGE_SIZE);
    const offX  = (W - IMAGE_SIZE * scale) / 2;
    const offY  = (H - IMAGE_SIZE * scale) / 2;

    if (minimapRef.current) {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(minimapRef.current, offX, offY, IMAGE_SIZE * scale, IMAGE_SIZE * scale);
      ctx.globalAlpha = 1.0;
    }

    const pts = visible();

    if (filters.heatmapMode !== 'off') {
      // Heatmap layer
      const heatPts = filters.heatmapMode === 'kills'
        ? pts.filter(e => e.event === 'Kill' || e.event === 'BotKill' || e.event === 'KilledByStorm')
        : pts;

      // Build heatmap on IMAGE_SIZE grid, then render to canvas
      const imgData = buildHeatmap(heatPts, W, H, IMAGE_SIZE);
      if (imgData) {
        ctx.putImageData(imgData, 0, 0);
      }
    } else {
      // Dot mode
      for (const e of pts) {
        const style = EVENT_STYLE[e.event];
        const cx = offX + e.px * scale;
        const cy = offY + e.py * scale;
        const r  = Math.max(1.5, style.radius * scale * 0.5);

        ctx.globalAlpha = style.alpha;
        ctx.fillStyle   = style.color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }
  }, [visible, filters.heatmapMode]);

  // Redraw on data/filter change
  useEffect(() => { draw(); }, [draw]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
