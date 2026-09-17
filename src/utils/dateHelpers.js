export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.round((d - today) / 86400000);
}

// Returns the nearest relevant upcoming date for an application, given its status
export function nextRelevantDate(app) {
  const candidates = [];
  if (app.status === 'assessment' && app.assessmentDate) {
    candidates.push({ label: 'Assessment', date: app.assessmentDate });
  }
  if (app.status === 'interview' && app.interviewDate) {
    candidates.push({ label: 'Interview', date: app.interviewDate });
  }
  if (app.followUpDate) {
    candidates.push({ label: 'Follow up', date: app.followUpDate });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => new Date(a.date) - new Date(b.date));
  return candidates[0];
}

export function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
