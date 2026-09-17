import { useMemo } from 'react';
import Column from './Column.jsx';
import { STATUS_META, COLUMN_ORDER } from '../utils/statusMeta.js';

function EmptyState({ onAddClick }) {
  return (
    <div className="empty-state">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </svg>
      <h2>No applications logged yet</h2>
      <p>Start tracking where you've applied, HR contacts, and every upcoming date in one place.</p>
      <button className="btn btn-primary" onClick={onAddClick}>
        + Log your first application
      </button>
    </div>
  );
}

export default function Board({ apps, searchTerm, onCardClick, onAddClick }) {
  const filtered = useMemo(() => {
    if (!searchTerm) return apps;
    const t = searchTerm.toLowerCase();
    return apps.filter(
      (a) => (a.company || '').toLowerCase().includes(t) || (a.role || '').toLowerCase().includes(t)
    );
  }, [apps, searchTerm]);

  if (apps.length === 0) {
    return <EmptyState onAddClick={onAddClick} />;
  }

  return (
    <div className="board">
      {COLUMN_ORDER.map((status) => (
        <Column
          key={status}
          status={status}
          meta={STATUS_META[status]}
          apps={filtered.filter((a) => a.status === status)}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
