(function(){
  const STORAGE_KEY = 'jobtrack-applications';

  const STATUS_META = {
    applied:     { label: 'Applied',              color: 'var(--s-applied)' },
    assessment:  { label: 'Assessment',            color: 'var(--s-assessment)' },
    interview:   { label: 'Interview',              color: 'var(--s-interview)' },
    offer:       { label: 'Offer',                  color: 'var(--s-offer)' },
    rejected:    { label: 'Rejected',               color: 'var(--s-rejected)' },
    withdrawn:   { label: 'Withdrawn',               color: 'var(--s-withdrawn)' },
  };
  const COLUMN_ORDER = ['applied','assessment','interview','offer','rejected','withdrawn'];

  let apps = [];
  let editingId = null;
  let searchTerm = '';

  const $ = (id) => document.getElementById(id);

  function uid(){
    return 'app_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
  }

  function showToast(msg){
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(()=> t.classList.remove('show'), 1800);
  }

  // Uses Claude's artifact storage when available (window.storage), and
  // falls back to the browser's own localStorage when running as a plain
  // file/site — so the same script works in both places.
  const hasClaudeStorage = typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';

  async function loadApps(){
    try{
      if(hasClaudeStorage){
        const res = await window.storage.get(STORAGE_KEY, false);
        apps = res && res.value ? JSON.parse(res.value) : [];
      }else{
        const raw = localStorage.getItem(STORAGE_KEY);
        apps = raw ? JSON.parse(raw) : [];
      }
    }catch(e){
      apps = [];
    }
    render();
  }

  async function persist(){
    try{
      if(hasClaudeStorage){
        const result = await window.storage.set(STORAGE_KEY, JSON.stringify(apps), false);
        if(!result){ showToast('Could not save — please retry.'); }
      }else{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
      }
    }catch(e){
      showToast('Could not save — please retry.');
    }
  }

  function daysUntil(dateStr){
    if(!dateStr) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(dateStr + 'T00:00:00');
    return Math.round((d - today) / 86400000);
  }

  // Returns the nearest relevant upcoming date for a card, given its status
  function nextRelevantDate(app){
    const candidates = [];
    if(app.status === 'assessment' && app.assessmentDate) candidates.push({label:'Assessment', date: app.assessmentDate});
    if(app.status === 'interview' && app.interviewDate) candidates.push({label:'Interview', date: app.interviewDate});
    if(app.followUpDate) candidates.push({label:'Follow up', date: app.followUpDate});
    if(!candidates.length) return null;
    candidates.sort((a,b)=> new Date(a.date) - new Date(b.date));
    return candidates[0];
  }

  function fmtDate(dateStr){
    if(!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  }

  function computeStats(){
    const total = apps.length;
    const active = apps.filter(a => !['rejected','withdrawn'].includes(a.status)).length;
    let followUpsDue = 0;
    let upcoming7 = 0;
    apps.forEach(a => {
      if(a.followUpDate){
        const d = daysUntil(a.followUpDate);
        if(d !== null && d <= 0) followUpsDue++;
      }
      const nd = nextRelevantDate(a);
      if(nd){
        const d = daysUntil(nd.date);
        if(d !== null && d >= 0 && d <= 7) upcoming7++;
      }
    });
    return { total, active, followUpsDue, upcoming7 };
  }

  function renderStats(){
    const s = computeStats();
    $('stats').innerHTML = `
      <div class="stat"><div class="num">${s.total}</div><div class="label">applications logged</div></div>
      <div class="stat"><div class="num">${s.active}</div><div class="label">still active</div></div>
      <div class="stat warn"><div class="num">${s.upcoming7}</div><div class="label">assessments / interviews in 7 days</div></div>
      <div class="stat danger"><div class="num">${s.followUpsDue}</div><div class="label">follow-ups due</div></div>
    `;
  }

  function matchesSearch(app){
    if(!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (app.company||'').toLowerCase().includes(t) || (app.role||'').toLowerCase().includes(t);
  }

  function renderBoard(){
    const wrap = $('boardWrap');
    if(apps.length === 0){
      wrap.innerHTML = `
        <div class="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="3" y="7" width="18" height="13" rx="2"/>
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <path d="M3 12h18"/>
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
          </svg>
          <h2>No applications logged yet</h2>
          <p>Start tracking where you've applied, HR contacts, and every upcoming date in one place.</p>
          <button class="btn btn-primary" onclick="document.getElementById('addBtn').click()">+ Log your first application</button>
        </div>`;
      return;
    }

    const filtered = apps.filter(matchesSearch);
    let html = '<div class="board">';
    COLUMN_ORDER.forEach(status => {
      const meta = STATUS_META[status];
      const colApps = filtered.filter(a => a.status === status)
        .sort((a,b) => {
          const na = nextRelevantDate(a), nb = nextRelevantDate(b);
          if(na && nb) return new Date(na.date) - new Date(nb.date);
          if(na) return -1;
          if(nb) return 1;
          return 0;
        });
      html += `<div class="column">
        <div class="column-head">
          <div class="name"><span class="swatch" style="background:${meta.color}"></span>${meta.label}</div>
          <div class="count">${colApps.length}</div>
        </div>
        <div class="column-body">`;
      colApps.forEach((app, i) => {
        const nd = nextRelevantDate(app);
        let badge = '';
        if(nd){
          const d = daysUntil(nd.date);
          let cls = 'later';
          let text = `${nd.label} · ${fmtDate(nd.date)}`;
          if(d < 0){ cls = 'overdue'; text = `${nd.label} overdue`; }
          else if(d === 0){ cls = 'overdue'; text = `${nd.label} today`; }
          else if(d <= 3){ cls = 'soon'; text = `${nd.label} in ${d}d`; }
          badge = `<span class="badge ${cls}">${text}</span>`;
        }
        html += `<div class="card" data-id="${app.id}" style="--card-accent:${meta.color}; animation-delay:${Math.min(i,8) * 35}ms;">
          <div class="company">${escapeHtml(app.company)}</div>
          <div class="role">${escapeHtml(app.role)}</div>
          <div class="meta-row">
            <div class="hr">${escapeHtml(app.hrName || 'No HR contact yet')}</div>
            ${badge}
          </div>
        </div>`;
      });
      html += `</div></div>`;
    });
    html += '</div>';
    wrap.innerHTML = html;

    wrap.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => openDrawer(card.getAttribute('data-id')));
    });
  }

  function triggerConfetti(){
    const colors = ['#5B8DEF', '#B587F5', '#E8A33D', '#45B587', '#E9ECF1'];
    for(let i = 0; i < 26; i++){
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
      piece.style.opacity = String(0.7 + Math.random() * 0.3);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3000);
    }
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function render(){
    renderStats();
    renderBoard();
  }

  function openDrawer(id){
    editingId = id || null;
    const app = id ? apps.find(a => a.id === id) : null;

    $('drawerTitle').textContent = app ? 'Edit application' : 'Log application';
    $('deleteBtn').style.display = app ? 'inline-block' : 'none';

    $('f-company').value = app ? app.company : '';
    $('f-role').value = app ? app.role : '';
    $('f-jd').value = app ? app.jobDescription : '';
    $('f-status').value = app ? app.status : 'applied';
    $('f-applied-date').value = app ? app.appliedDate || '' : new Date().toISOString().slice(0,10);
    $('f-followup-date').value = app ? app.followUpDate || '' : '';
    $('f-assessment-date').value = app ? app.assessmentDate || '' : '';
    $('f-interview-date').value = app ? app.interviewDate || '' : '';
    $('f-hr-name').value = app ? app.hrName || '' : '';
    $('f-hr-contact').value = app ? app.hrContact || '' : '';
    $('f-notes').value = app ? app.notes || '' : '';

    $('overlay').classList.add('open');
    $('drawer').classList.add('open');
  }

  function closeDrawer(){
    $('overlay').classList.remove('open');
    $('drawer').classList.remove('open');
    editingId = null;
  }

  async function saveApp(){
    const company = $('f-company').value.trim();
    const role = $('f-role').value.trim();
    if(!company || !role){
      showToast('Company and role are required.');
      return;
    }
    const data = {
      company, role,
      jobDescription: $('f-jd').value.trim(),
      status: $('f-status').value,
      appliedDate: $('f-applied-date').value,
      followUpDate: $('f-followup-date').value,
      assessmentDate: $('f-assessment-date').value,
      interviewDate: $('f-interview-date').value,
      hrName: $('f-hr-name').value.trim(),
      hrContact: $('f-hr-contact').value.trim(),
      notes: $('f-notes').value.trim(),
    };

    const wasOffer = editingId ? (apps.find(a => a.id === editingId) || {}).status === 'offer' : false;

    if(editingId){
      const idx = apps.findIndex(a => a.id === editingId);
      if(idx > -1) apps[idx] = { ...apps[idx], ...data };
      showToast('Application updated.');
    }else{
      apps.push({ id: uid(), createdAt: Date.now(), ...data });
      showToast('Application logged.');
    }
    await persist();
    render();
    closeDrawer();

    if(data.status === 'offer' && !wasOffer){
      triggerConfetti();
      showToast('🎉 Offer logged — congratulations!');
    }
  }

  async function deleteApp(){
    if(!editingId) return;
    if(!confirm('Delete this application? This cannot be undone.')) return;
    apps = apps.filter(a => a.id !== editingId);
    await persist();
    render();
    closeDrawer();
    showToast('Application deleted.');
  }

  // Events
  $('addBtn').addEventListener('click', () => openDrawer(null));
  $('closeDrawer').addEventListener('click', closeDrawer);
  $('cancelBtn').addEventListener('click', closeDrawer);
  $('overlay').addEventListener('click', closeDrawer);
  $('saveBtn').addEventListener('click', (e) => { e.preventDefault(); saveApp(); });
  $('deleteBtn').addEventListener('click', deleteApp);
  $('appForm').addEventListener('submit', (e) => e.preventDefault());
  $('searchBox').addEventListener('input', (e) => { searchTerm = e.target.value; renderBoard(); });

  loadApps();
})();