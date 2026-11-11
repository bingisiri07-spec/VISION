import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Sparkles, AlertTriangle, CheckCircle2, Loader,
  Handshake, Star, ChevronDown, ChevronUp, Trash2, X,
  UserCheck, Briefcase, ArrowRight, RefreshCw, Info, DollarSign
} from 'lucide-react';
import {
  getOpenOpportunities, getMyOpportunities, createOpportunity,
  toggleOpportunityStatus, deleteOpportunity,
  applyToOpportunity, getMyApplications, getIncomingApplications,
  updateApplicationStatus, withdrawApplication,
  getSponsorshipRequests, createSponsorshipRequest,
  deleteSponsorshipRequest, getMySponsorshipRequests,
} from '../../services/collaborationService';
import { useAuth } from '../../context/AuthContext';

// ─── Reusable feedback banner ────────────────────────────────────────────────
function Banner({ type, message, onDismiss }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div style={{
      padding: '0.7rem 1rem',
      borderRadius: '10px',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      fontSize: '0.85rem',
      background: isError ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
      border: `1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
      color: isError ? '#fca5a5' : '#86efac',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isError ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{ color: 'var(--text-dim)', cursor: 'pointer' }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Skill / tag chip ────────────────────────────────────────────────────────
function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.3rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.775rem',
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        background: active ? 'rgba(29,114,254,0.3)' : 'rgba(15,23,42,0.6)',
        border: active ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
        color: active ? '#ffffff' : 'var(--text-muted)',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

const SKILLS = ['AI/ML', 'Frontend', 'Backend', 'UI/UX Design', 'Marketing', 'Research', 'Business Dev', 'Data Science', 'DevOps', 'Other'];
const COLLAB_TYPES = [
  { value: 'teammate', label: 'Co-Founder / Teammate' },
  { value: 'technical', label: 'Technical Contributor' },
  { value: 'mentor', label: 'Mentor / Advisor' },
  { value: 'other', label: 'Other Collaborator' },
];
const COMMITMENT_LEVELS = [
  { value: 'part-time', label: 'Part-Time' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'flexible', label: 'Flexible / Project-Based' },
];
const SUPPORT_TYPES = ['Funding', 'Cloud Credits', 'Mentorship', 'Tools & Licenses', 'Co-Working Space', 'Marketing Support', 'Legal Support', 'Other'];

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'rgba(2,6,18,0.6)',
  border: '1px solid rgba(56,189,248,0.25)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#ffffff',
  marginBottom: '0.35rem',
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending: { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24', label: 'Pending' },
    accepted: { bg: 'rgba(34,197,94,0.2)', color: '#86efac', label: 'Accepted' },
    declined: { bg: 'rgba(239,68,68,0.2)', color: '#fca5a5', label: 'Declined' },
    open: { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8', label: 'Open' },
    closed: { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', label: 'Closed' },
  };
  const s = map[status] || map['pending'];
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

// ─── OPPORTUNITY CARD ─────────────────────────────────────────────────────────
function OpportunityCard({ opp, currentUserId, onApply, onToggle, onDelete, myApplications }) {
  const [expanded, setExpanded] = useState(false);
  const isOwner = opp.user_id === currentUserId;
  const alreadyApplied = myApplications.some((a) => a.opportunity_id === opp.id);
  const posterName = opp.profiles?.full_name || opp.profiles?.email?.split('@')[0] || 'Anonymous';
  const ventureName = opp.projects?.title || opp.venture_summary || 'Independent Project';

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{opp.title}</h3>
            <StatusBadge status={opp.is_open ? 'open' : 'closed'} />
            {isOwner && <span style={{ fontSize: '0.7rem', color: 'var(--cyan-glow)', fontWeight: 700 }}>• Your Post</span>}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            By <strong style={{ color: 'var(--text-silver)' }}>{posterName}</strong> · {ventureName}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            <Chip label={COLLAB_TYPES.find(t => t.value === opp.collab_type)?.label || opp.collab_type} />
            <Chip label={opp.commitment_level} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!isOwner && opp.is_open && !alreadyApplied && (
            <button
              onClick={() => onApply(opp)}
              className="btn-primary-glow"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
            >
              <Handshake size={13} />
              <span>Express Interest</span>
            </button>
          )}
          {!isOwner && alreadyApplied && (
            <span style={{ fontSize: '0.78rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> Applied
            </span>
          )}
          {isOwner && (
            <>
              <button
                onClick={() => onToggle(opp.id, !opp.is_open)}
                className="btn-secondary-pill"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                {opp.is_open ? 'Close' : 'Reopen'}
              </button>
              <button
                onClick={() => onDelete(opp.id)}
                style={{ color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}
                title="Delete opportunity"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-silver)', lineHeight: 1.55, marginBottom: '0.75rem' }}>
            {opp.description}
          </p>
          {Array.isArray(opp.skills_needed) && opp.skills_needed.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Skills needed:</span>
              {opp.skills_needed.map((s) => <Chip key={s} label={s} active />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── APPLY MODAL ─────────────────────────────────────────────────────────────
function ApplyModal({ opportunity, onClose, onSubmit }) {
  const [intro, setIntro] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!intro.trim() || intro.trim().length < 20) {
      setError('Please write at least 20 characters explaining how you can contribute.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(opportunity.id, intro);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 3500, backgroundColor: 'rgba(2,6,18,0.88)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      onClick={onClose}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.25rem', border: '1px solid rgba(56,189,248,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Express Interest</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{opportunity.title}</h2>
        </div>
        <Banner type="error" message={error} onDismiss={() => setError('')} />
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Your Introduction <span style={{ color: '#fca5a5' }}>*</span></label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Briefly explain your background and how you can contribute to this venture (min. 20 characters)..."
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>{intro.length} characters</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={loading} className="btn-primary-glow" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><Loader size={15} className="spin" /><span>Sending...</span></> : <><Handshake size={15} /><span>Submit Interest</span></>}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary-pill">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── CREATE OPPORTUNITY FORM ──────────────────────────────────────────────────
function CreateOpportunityForm({ userProjects, onCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ventureSummary, setVentureSummary] = useState('');
  const [collabType, setCollabType] = useState('teammate');
  const [commitmentLevel, setCommitmentLevel] = useState('part-time');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Please provide an opportunity title.'); return; }
    if (!description.trim() || description.length < 30) { setError('Description must be at least 30 characters.'); return; }
    setLoading(true);
    try {
      await createOpportunity({ title, description, ventureSummary, collabType, skillsNeeded: selectedSkills, commitmentLevel, projectId: projectId || null });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(56,189,248,0.25)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>New Post</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Post a Collaboration Opportunity</h3>
      </div>
      <Banner type="error" message={error} onDismiss={() => setError('')} />
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Opportunity Title <span style={{ color: '#fca5a5' }}>*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Looking for a Frontend Co-Founder" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Linked Venture</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
              <option value="">— Standalone / Not linked —</option>
              {userProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Venture Summary</label>
          <input type="text" value={ventureSummary} onChange={(e) => setVentureSummary(e.target.value)} placeholder="One-line description of your project (optional)" style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>What You're Looking For <span style={{ color: '#fca5a5' }}>*</span></label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and what you'd be working on together..." rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Collaborator Type</label>
            <select value={collabType} onChange={(e) => setCollabType(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
              {COLLAB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Commitment Level</label>
            <select value={commitmentLevel} onChange={(e) => setCommitmentLevel(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
              {COMMITMENT_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Skills / Roles Needed</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
            {SKILLS.map((s) => <Chip key={s} label={s} active={selectedSkills.includes(s)} onClick={() => toggleSkill(s)} />)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={loading} className="btn-primary-glow" style={{ flex: 1, justifyContent: 'center' }}>
            {loading ? <><Loader size={15} className="spin" /><span>Posting...</span></> : <><Plus size={15} /><span>Post Opportunity</span></>}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary-pill">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── CREATE SPONSORSHIP FORM ──────────────────────────────────────────────────
function CreateSponsorshipForm({ userProjects, onCreated, onCancel }) {
  const [ventureTitle, setVentureTitle] = useState('');
  const [ventureDescription, setVentureDescription] = useState('');
  const [selectedSupport, setSelectedSupport] = useState([]);
  const [askDetails, setAskDetails] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSupport = (s) => setSelectedSupport(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ventureTitle.trim()) { setError('Venture title is required.'); return; }
    if (!ventureDescription.trim() || ventureDescription.length < 30) { setError('Description must be at least 30 characters.'); return; }
    if (!selectedSupport.length) { setError('Select at least one type of support you are seeking.'); return; }
    setLoading(true);
    try {
      await createSponsorshipRequest({ ventureTitle, ventureDescription, supportTypes: selectedSupport, askDetails, projectId: projectId || null });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(56,189,248,0.25)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Sponsorship Request</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Describe Your Support Needs</h3>
      </div>
      <Banner type="error" message={error} onDismiss={() => setError('')} />
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Venture Name <span style={{ color: '#fca5a5' }}>*</span></label>
            <input type="text" value={ventureTitle} onChange={(e) => setVentureTitle(e.target.value)} placeholder="Your startup or project name" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Linked Project</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
              <option value="">— Standalone —</option>
              {userProjects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Venture Description <span style={{ color: '#fca5a5' }}>*</span></label>
          <textarea value={ventureDescription} onChange={(e) => setVentureDescription(e.target.value)} placeholder="Describe what your venture does and the problem it solves..." rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Type of Support Needed <span style={{ color: '#fca5a5' }}>*</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
            {SUPPORT_TYPES.map((s) => <Chip key={s} label={s} active={selectedSupport.includes(s)} onClick={() => toggleSupport(s)} />)}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Specific Ask / Details</label>
          <textarea value={askDetails} onChange={(e) => setAskDetails(e.target.value)} placeholder="What exactly are you looking for? (e.g. \$5,000 seed grant, AWS credits for 12 months, weekly mentorship calls)" rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={loading} className="btn-primary-glow" style={{ flex: 1, justifyContent: 'center' }}>
            {loading ? <><Loader size={15} className="spin" /><span>Posting...</span></> : <><DollarSign size={15} /><span>Post Request</span></>}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary-pill">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ─── MAIN COLLABORATIONS HUB ──────────────────────────────────────────────────
export default function CollaborationsHub({ projectState }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [opportunities, setOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [incomingApplications, setIncomingApplications] = useState([]);
  const [sponsorshipRequests, setSponsorshipRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCreateOpp, setShowCreateOpp] = useState(false);
  const [showCreateSponsorship, setShowCreateSponsorship] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);

  // Build a list of user's saved ventures for dropdowns
  const userProjects = projectState?.projectId
    ? [{ id: projectState.projectId, title: projectState.selectedIdea?.name || 'Current Venture' }]
    : [];

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [opps, apps, incoming, sponsorships] = await Promise.all([
        getOpenOpportunities(),
        user ? getMyApplications() : Promise.resolve([]),
        user ? getIncomingApplications() : Promise.resolve([]),
        getSponsorshipRequests(),
      ]);
      setOpportunities(opps);
      setMyApplications(apps);
      setIncomingApplications(incoming);
      setSponsorshipRequests(sponsorships);
    } catch (err) {
      setError('Failed to load collaboration data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };

  const handleApply = async (oppId, intro) => {
    await applyToOpportunity(oppId, intro);
    showSuccess('Your expression of interest has been submitted!');
    await loadAll();
  };

  const handleToggle = async (oppId, newState) => {
    try {
      await toggleOpportunityStatus(oppId, newState);
      showSuccess(newState ? 'Opportunity reopened.' : 'Opportunity closed.');
      await loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteOpp = async (oppId) => {
    if (!window.confirm('Delete this opportunity? All applications to it will also be removed.')) return;
    try {
      await deleteOpportunity(oppId);
      showSuccess('Opportunity deleted.');
      await loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      showSuccess(`Application ${status}.`);
      await loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw your application?')) return;
    try {
      await withdrawApplication(appId);
      showSuccess('Application withdrawn.');
      await loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleDeleteSponsorship = async (id) => {
    if (!window.confirm('Remove this sponsorship request?')) return;
    try {
      await deleteSponsorshipRequest(id);
      showSuccess('Sponsorship request removed.');
      await loadAll();
    } catch (err) { setError(err.message); }
  };

  const tabs = [
    { id: 'browse', label: 'Browse Opportunities', icon: <Users size={15} /> },
    { id: 'my-apps', label: 'My Applications', icon: <UserCheck size={15} /> },
    { id: 'incoming', label: 'Incoming Requests', icon: <Briefcase size={15} /> },
    { id: 'sponsorship', label: 'Sponsorship', icon: <Star size={15} /> },
  ];

  const myOwnOpportunities = opportunities.filter(o => o.user_id === user?.id);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', border: '1px solid rgba(56,189,248,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '0.35rem' }}>
              Collaboration Network
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>Collaborations Hub</h1>
            <p style={{ color: 'var(--text-silver)', fontSize: '1rem', maxWidth: '680px' }}>
              Connect with builders, mentors, and contributors. Post opportunities, discover collaborators, and find sponsorship support for your ventures.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <button onClick={() => { setShowCreateOpp(true); setShowCreateSponsorship(false); setActiveTab('browse'); }} className="btn-secondary-pill">
                  <Plus size={15} /><span>Post Opportunity</span>
                </button>
                <button onClick={() => { setShowCreateSponsorship(true); setShowCreateOpp(false); setActiveTab('sponsorship'); }} className="btn-secondary-pill">
                  <DollarSign size={15} /><span>Seek Sponsorship</span>
                </button>
              </>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={14} />
                <span>Sign in to post or apply</span>
              </div>
            )}
            <button onClick={loadAll} disabled={loading} className="btn-secondary-pill" title="Refresh">
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Global banners */}
      <Banner type="error" message={error} onDismiss={() => setError('')} />
      <Banner type="success" message={successMsg} onDismiss={() => setSuccessMsg('')} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', padding: '0.3rem', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.15)', marginBottom: '2rem' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '9px',
                fontSize: '0.825rem', fontWeight: 600, whiteSpace: 'nowrap',
                background: isActive ? 'linear-gradient(135deg,#1d72fe,#2563eb)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-silver)',
                boxShadow: isActive ? '0 0 14px rgba(29,114,254,0.45)' : 'none',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
            >
              {tab.icon}<span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-silver)' }}>
          <Loader size={36} className="spin" style={{ margin: '0 auto 1rem auto' }} />
          <p>Loading collaboration data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ── TAB: BROWSE OPPORTUNITIES ── */}
          {activeTab === 'browse' && (
            <div>
              {showCreateOpp && (
                <CreateOpportunityForm
                  userProjects={userProjects}
                  onCreated={() => { setShowCreateOpp(false); showSuccess('Opportunity posted successfully!'); loadAll(); }}
                  onCancel={() => setShowCreateOpp(false)}
                />
              )}

              {!showCreateOpp && user && (
                <button onClick={() => setShowCreateOpp(true)} className="btn-secondary-pill" style={{ marginBottom: '1.5rem' }}>
                  <Plus size={15} /><span>Post a New Opportunity</span>
                </button>
              )}

              {opportunities.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <Users size={40} color="#38bdf8" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>No Open Opportunities Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first to post a collaboration opportunity for your venture.</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>{opportunities.length} open opportunit{opportunities.length === 1 ? 'y' : 'ies'}</div>
                  {opportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opp={opp}
                      currentUserId={user?.id}
                      onApply={(o) => setApplyTarget(o)}
                      onToggle={handleToggle}
                      onDelete={handleDeleteOpp}
                      myApplications={myApplications}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── TAB: MY APPLICATIONS ── */}
          {activeTab === 'my-apps' && (
            <div>
              {!user ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <Info size={36} color="#38bdf8" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Sign in to view your applications.</p>
                </div>
              ) : myApplications.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <UserCheck size={40} color="#38bdf8" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>No Applications Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Browse open opportunities and express your interest to get started.</p>
                  <button onClick={() => setActiveTab('browse')} className="btn-primary-glow" style={{ marginTop: '1.25rem' }}>
                    <span>Browse Opportunities</span><ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                myApplications.map((app) => (
                  <div key={app.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
                          {app.collaboration_opportunities?.title || 'Opportunity'}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                          By {app.collaboration_opportunities?.profiles?.full_name || app.collaboration_opportunities?.profiles?.email?.split('@')[0] || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-silver)', lineHeight: 1.5 }}>
                          <strong>Your introduction:</strong> {app.introduction}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <StatusBadge status={app.status} />
                        {app.status === 'pending' && (
                          <button onClick={() => handleWithdraw(app.id)} style={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <X size={13} /><span>Withdraw</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: INCOMING REQUESTS ── */}
          {activeTab === 'incoming' && (
            <div>
              {!user ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <Info size={36} color="#38bdf8" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Sign in to view incoming collaboration requests.</p>
                </div>
              ) : incomingApplications.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <Briefcase size={40} color="#38bdf8" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>No Incoming Requests</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Once you post an opportunity, applicants will appear here.</p>
                </div>
              ) : (
                incomingApplications.map((app) => (
                  <div key={app.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.2rem' }}>
                          For: <strong style={{ color: 'var(--text-silver)' }}>{app.collaboration_opportunities?.title}</strong>
                        </div>
                        <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.3rem' }}>
                          {app.profiles?.full_name || app.profiles?.email?.split('@')[0] || 'Anonymous'}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-silver)', lineHeight: 1.5 }}>
                          {app.introduction}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                        <StatusBadge status={app.status} />
                        {app.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleUpdateAppStatus(app.id, 'accepted')} className="btn-secondary-pill" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderColor: 'rgba(34,197,94,0.4)', color: '#86efac' }}>Accept</button>
                            <button onClick={() => handleUpdateAppStatus(app.id, 'declined')} className="btn-secondary-pill" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>Decline</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: SPONSORSHIP ── */}
          {activeTab === 'sponsorship' && (
            <div>
              {/* Disclaimer */}
              <div style={{ padding: '0.9rem 1.1rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <Info size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.82rem', color: 'var(--text-silver)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fbbf24' }}>Community Board — Not a Verified Sponsor Directory.</strong> All listings below are created by VISION users describing their own support needs or offerings. VISION does not endorse, verify, or guarantee any funding, partnerships, or external resources listed here.
                </p>
              </div>

              {showCreateSponsorship && user ? (
                <CreateSponsorshipForm
                  userProjects={userProjects}
                  onCreated={() => { setShowCreateSponsorship(false); showSuccess('Sponsorship request posted!'); loadAll(); }}
                  onCancel={() => setShowCreateSponsorship(false)}
                />
              ) : user && (
                <button onClick={() => setShowCreateSponsorship(true)} className="btn-secondary-pill" style={{ marginBottom: '1.5rem' }}>
                  <Plus size={15} /><span>Post Sponsorship Request</span>
                </button>
              )}

              {sponsorshipRequests.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <Star size={40} color="#38bdf8" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>No Sponsorship Requests Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first to describe your venture's support needs.</p>
                </div>
              ) : (
                sponsorshipRequests.map((req) => {
                  const isOwner = req.user_id === user?.id;
                  const posterName = req.profiles?.full_name || req.profiles?.email?.split('@')[0] || 'Anonymous';
                  return (
                    <div key={req.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{req.venture_title}</h3>
                            {isOwner && <span style={{ fontSize: '0.7rem', color: 'var(--cyan-glow)', fontWeight: 700 }}>• Your Request</span>}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
                            Posted by <strong style={{ color: 'var(--text-silver)' }}>{posterName}</strong>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-silver)', lineHeight: 1.5, marginBottom: '0.75rem' }}>{req.venture_description}</p>
                          {Array.isArray(req.support_types) && req.support_types.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Seeking:</span>
                              {req.support_types.map((s) => <Chip key={s} label={s} active />)}
                            </div>
                          )}
                          {req.ask_details && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                              <strong>Specific ask:</strong> {req.ask_details}
                            </div>
                          )}
                        </div>
                        {isOwner && (
                          <button onClick={() => handleDeleteSponsorship(req.id)} style={{ color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Apply Modal */}
      {applyTarget && (
        <ApplyModal
          opportunity={applyTarget}
          onClose={() => setApplyTarget(null)}
          onSubmit={handleApply}
        />
      )}
    </div>
  );
}
