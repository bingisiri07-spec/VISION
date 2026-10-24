import React, { useState, useEffect } from 'react';
import { getUserProjects, deleteCloudProject } from '../../services/projectService';
import {
  X,
  Plus,
  Layers,
  Calendar,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function ProjectsModal({
  isOpen,
  onClose,
  activeProjectId,
  onSelectProject,
  onStartNewProject,
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getUserProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? All associated ideas, roadmaps, and tasks will be removed.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCloudProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (activeProjectId === id) {
        onStartNewProject();
      }
    } catch (err) {
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        backgroundColor: 'rgba(2, 6, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: 0,
          overflow: 'hidden',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 0 60px rgba(29, 114, 254, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.75rem 2rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--cyan-glow)',
                marginBottom: '0.25rem',
              }}
            >
              <Layers size={14} />
              <span>Cloud Storage</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              My Ventures ({projects.length})
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                onStartNewProject();
                onClose();
              }}
              className="btn-primary-glow"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <Plus size={15} />
              <span>New Venture</span>
            </button>

            <button
              onClick={onClose}
              style={{ color: 'var(--text-silver)', padding: '0.4rem', borderRadius: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Project List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-silver)' }}>
              Loading your ventures from Supabase...
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-silver)' }}>
              <Layers size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                No saved ventures yet
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                Start a problem discovery session to synthesize your first startup opportunities and save them to the cloud.
              </p>
              <button
                onClick={() => {
                  onStartNewProject();
                  onClose();
                }}
                className="btn-primary-glow"
                style={{ padding: '0.65rem 1.4rem' }}
              >
                <span>Launch Problem Discovery</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            projects.map((p) => {
              const isActive = p.id === activeProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    onClose();
                  }}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(29, 114, 254, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                    border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isActive ? '0 0 20px rgba(56, 189, 248, 0.2)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                        }}
                      >
                        {p.domain}
                      </span>
                      {p.journey_started && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#4ade80',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <CheckCircle2 size={11} />
                          <span>Journey Active</span>
                        </span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--cyan-glow)', fontWeight: 600 }}>
                          • Active in Workspace
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                      {p.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-silver)',
                        marginTop: '0.25rem',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.problem_statement}
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={12} />
                      <span>Created {new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      onClick={(e) => handleDelete(e, p.id)}
                      disabled={deletingId === p.id}
                      title="Delete Venture"
                      style={{
                        padding: '0.5rem',
                        color: 'var(--text-dim)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      className={isActive ? "btn-primary-glow" : "btn-secondary-pill"}
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
                    >
                      <span>{isActive ? 'Current' : 'Open'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
