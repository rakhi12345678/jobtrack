import { daysUntil, nextRelevantDate, fmtDate } from '../utils/dateHelpers.js';

export default function Card({ app, accentColor, delayMs, onClick }) {
  const nd = nextRelevantDate(app);
  let badge = null;

  if (nd) {
    const d = daysUntil(nd.date);
    let cls = 'later';
    let text = `${nd.label} · ${fmtDate(nd.date)}`;
    if (d < 0) {
      cls = 'overdue';
      text = `${nd.label} overdue`;
    } else if (d === 0) {
      cls = 'overdue';
      text = `${nd.label} today`;
    } else if (d <= 3) {
      cls = 'soon';
      text = `${nd.label} in ${d}d`;
    }
    badge = <span className={`badge ${cls}`}>{text}</span>;
  }

  return (
    <div
      className="card"
      style={{ '--card-accent': accentColor, animationDelay: `${delayMs}ms` }}
      onClick={() => onClick(app.id)}
    >
      <div className="company">{app.company}</div>
      <div className="role">{app.role}</div>
      <div className="meta-row">
        <div className="hr">{app.hrName || 'No HR contact yet'}</div>
        {badge}
      </div>
    </div>
  );
}
