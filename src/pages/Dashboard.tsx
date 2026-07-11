import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { Search, Plus, Clock, Trash2, Edit, HelpCircle, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    tests,
    subjects,
    topics,
    fetchTests,
    fetchLookups,
    deleteTest,
    isLoading
  } = useStore();

  const navigate = useNavigate();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Deletion modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLookups();
    fetchTests();
  }, [fetchTests, fetchLookups]);

  // Helper to map subject UUID to subject name
  const getSubjectName = (subjectId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    return sub ? sub.name : 'Unknown Subject';
  };

  // Helper to map topic UUIDs to comma-separated topic names
  const getTopicNames = (topicIds: string[]) => {
    if (!topicIds || topicIds.length === 0) return 'No Topics';
    return topicIds
      .map(id => {
        const top = topics.find(t => t.id === id);
        return top ? top.name : null;
      })
      .filter(Boolean)
      .join(', ') || 'No Topics';
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      const success = await deleteTest(deletingId);
      if (success) {
        setDeletingId(null);
      }
    }
  };

  // Filtered tests list
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || test.type === selectedType;
    const matchesSubject = selectedSubject === 'all' || test.subject === selectedSubject;
    return matchesSearch && matchesType && matchesSubject;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 800, letterSpacing: '-0.03em' }}>Tests Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage, edit, preview, and publish tests inside the question bank.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/test/new')}>
          <Plus size={18} />
          <span>Create New Test</span>
        </button>
      </div>

      {/* Search & Filtering Panel */}
      <div className="glass-panel" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', padding: '16px 20px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '94%', top: '14px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '42px', margin: 0 }}
            placeholder="Search tests by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ margin: 0 }}
          >
            <option value="all">All Types</option>
            <option value="chapterwise">Chapterwise</option>
            <option value="mock">Full Mock Test</option>
            <option value="pyq">Previous Year (PYQ)</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ margin: 0 }}
          >
            <option value="all">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      {isLoading && tests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          Loading tests database...
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          No tests found matching the selected filters.
        </div>
      ) : (
        <div className="dashboard-grid">
          {filteredTests.map((test) => (
            <div key={test.id} className="glass-panel test-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className={`badge badge-${test.status}`}>
                  {test.status}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 600 }}>
                  {test.type}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {test.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Subject:</span>
                    <span>{getSubjectName(test.subject)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getTopicNames(test.topics)}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Topics:</span>
                    <span>{getTopicNames(test.topics)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', borderTop: '1px solid var(--panel-border)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      <span>{test.total_time} mins</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HelpCircle size={14} />
                      <span>{test.total_questions} Qs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} />
                      <span>{test.total_marks} Marks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '16px',
                borderTop: '1px solid var(--panel-border)',
                paddingTop: '14px'
              }}>
                <button
                  onClick={() => navigate(`/test/edit/${test.id}`)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                >
                  <Edit size={14} />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => navigate(`/test/${test.id}/questions`)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                >
                  <span>Questions</span>
                </button>
                <button
                  onClick={() => navigate(`/test/${test.id}/preview`)}
                  className="btn btn-primary"
                  style={{ gridColumn: 'span 2', padding: '8px 12px', fontSize: '13px' }}
                >
                  <span>Preview & Publish</span>
                </button>
                <button
                  onClick={() => setDeletingId(test.id || null)}
                  className="btn btn-danger"
                  style={{ gridColumn: 'span 2', padding: '6px 12px', fontSize: '12px', marginTop: '4px' }}
                >
                  <Trash2 size={13} />
                  <span>Delete Test</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Deletion Modal */}
      {deletingId && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-fade-in" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Confirm Deletion</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Are you sure you want to delete this test? This action is permanent and will remove all associated settings.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
