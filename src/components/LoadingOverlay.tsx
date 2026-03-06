'use client';

export default function LoadingOverlay({ message = 'Loading map data…' }: { message?: string }) {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}
