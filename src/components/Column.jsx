import { useMemo } from 'react';
import Card from './Card.jsx';
import { nextRelevantDate } from '../utils/dateHelpers.js';

export default function Column({ status, meta, apps, onCardClick }) {
  const sorted = useMemo(() => {
    return [...apps].sort((a, b) => {
      const na = nextRelevantDate(a);
      const nb = nextRelevantDate(b);
      if (na && nb) return new Date(na.date) - new Date(nb.date);
      if (na) return -1;
      if (nb) return 1;
      return 0;
    });
  }, [apps]);

  return (
    <div className="column">
      <div className="column-head">
        <div className="name">
          <span className="swatch" style={{ background: meta.color }} />
          {meta.label}
        </div>
        <div className="count">{sorted.length}</div>
      </div>
      <div className="column-body">
        {sorted.map((app, i) => (
          <Card
            key={app.id}
            app={app}
            accentColor={meta.color}
            delayMs={Math.min(i, 8) * 35}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}
