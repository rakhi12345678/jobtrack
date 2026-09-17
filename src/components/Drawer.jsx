import { useState, useEffect } from 'react';

const EMPTY_FORM = {
  company: '',
  role: '',
  jobDescription: '',
  status: 'applied',
  appliedDate: new Date().toISOString().slice(0, 10),
  followUpDate: '',
  assessmentDate: '',
  interviewDate: '',
  hrName: '',
  hrContact: '',
  notes: '',
};

export default function Drawer({ isOpen, app, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);

  // Re-sync the form whenever a different application is opened (or the
  // drawer is opened fresh for a new entry).
  useEffect(() => {
    if (isOpen) {
      setForm(app ? { ...EMPTY_FORM, ...app } : EMPTY_FORM);
    }
  }, [isOpen, app]);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    onSave(form);
  }

  return (
    <>
      <div className={`overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h2>{app ? 'Edit application' : 'Log application'}</h2>
          <button className="drawer-close" onClick={onClose}>&times;</button>
        </div>

        <div className="drawer-body">
          <form onSubmit={handleSubmit}>
            <div className="fieldset-title">Company &amp; role</div>
            <div className="field-row">
              <div className="field">
                <label>Company</label>
                <input value={form.company} onChange={(e) => setField('company', e.target.value)} required />
              </div>
              <div className="field">
                <label>Role</label>
                <input value={form.role} onChange={(e) => setField('role', e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label>Job description</label>
              <textarea
                value={form.jobDescription}
                placeholder="Paste key responsibilities, tech stack, etc."
                onChange={(e) => setField('jobDescription', e.target.value)}
              />
            </div>

            <div className="fieldset-title">Status &amp; dates</div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                <option value="applied">Applied</option>
                <option value="assessment">Assessment scheduled</option>
                <option value="interview">Interview scheduled</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Applied on</label>
                <input type="date" value={form.appliedDate} onChange={(e) => setField('appliedDate', e.target.value)} />
              </div>
              <div className="field">
                <label>Follow up on</label>
                <input type="date" value={form.followUpDate} onChange={(e) => setField('followUpDate', e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Assessment date</label>
                <input type="date" value={form.assessmentDate} onChange={(e) => setField('assessmentDate', e.target.value)} />
              </div>
              <div className="field">
                <label>Interview date</label>
                <input type="date" value={form.interviewDate} onChange={(e) => setField('interviewDate', e.target.value)} />
              </div>
            </div>

            <div className="fieldset-title">HR contact</div>
            <div className="field-row">
              <div className="field">
                <label>HR name</label>
                <input value={form.hrName} onChange={(e) => setField('hrName', e.target.value)} />
              </div>
              <div className="field">
                <label>Email / phone</label>
                <input value={form.hrContact} onChange={(e) => setField('hrContact', e.target.value)} />
              </div>
            </div>

            <div className="fieldset-title">Notes</div>
            <div className="field">
              <textarea
                value={form.notes}
                placeholder="Anything you want to remember — referral, interview feedback, salary talk…"
                onChange={(e) => setField('notes', e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="drawer-footer">
          {app ? (
            <button className="btn btn-danger" onClick={() => onDelete(app.id)}>Delete</button>
          ) : (
            <span />
          )}
          <div className="right">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </div>
        </div>
      </div>
    </>
  );
}
