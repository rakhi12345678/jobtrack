import { useMemo } from 'react';
import { daysUntil, nextRelevantDate } from '../utils/dateHelpers.js';

export default function StatsBar({ apps }) {
  const stats = useMemo(() => {
    const total = apps.length;
    const active = apps.filter((a) => !['rejected', 'withdrawn'].includes(a.status)).length;
    let followUpsDue = 0;
    let upcoming7 = 0;

    apps.forEach((a) => {
      if (a.followUpDate) {
        const d = daysUntil(a.followUpDate);
        if (d !== null && d <= 0) followUpsDue++;
      }
      const nd = nextRelevantDate(a);
      if (nd) {
        const d = daysUntil(nd.date);
        if (d !== null && d >= 0 && d <= 7) upcoming7++;
      }
    });

    return { total, active, followUpsDue, upcoming7 };
  }, [apps]);

  return (
    <div className="stats">
      <div className="stat">
        <div className="num">{stats.total}</div>
        <div className="label">applications logged</div>
      </div>
      <div className="stat">
        <div className="num">{stats.active}</div>
        <div className="label">still active</div>
      </div>
      <div className="stat warn">
        <div className="num">{stats.upcoming7}</div>
        <div className="label">assessments / interviews in 7 days</div>
      </div>
      <div className="stat danger">
        <div className="num">{stats.followUpsDue}</div>
        <div className="label">follow-ups due</div>
      </div>
    </div>
  );
}
