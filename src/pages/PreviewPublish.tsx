import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { ArrowLeft, Send } from 'lucide-react';

export const PreviewPublish: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentTest,
    questions,
    subjects,
    topics,
    fetchTestById,
    fetchQuestions,
    updateTest,
    isLoading
  } = useStore();

  // Publish Status state
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft');
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [liveUntil, setLiveUntil] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (testId) {
      fetchTestById(testId);
      fetchQuestions(testId);
    }
  }, [testId, fetchTestById, fetchQuestions]);

  // Set default state once currentTest loads
  useEffect(() => {
    if (currentTest) {
      setPublishStatus(currentTest.status);
      if (currentTest.live_until) {
        // Convert ISO date to datetime-local value (YYYY-MM-DDThh:mm)
        const dateObj = new Date(currentTest.live_until);
        const tzOffset = dateObj.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);
        setLiveUntil(localISOTime);
      }
    }
  }, [currentTest]);

  // Helper to map subject UUID to name
  const getSubjectName = (subjectId: string) => {
    const sub = subjects.find(s => s.id === subjectId);
    return sub ? sub.name : 'General';
  };

  // Helper to map topic UUIDs to names list
  const getTopicNames = (topicIds: string[]) => {
    if (!topicIds || topicIds.length === 0) return 'None';
    return topicIds
      .map(id => {
        const top = topics.find(t => t.id === id);
        return top ? top.name : null;
      })
      .filter(Boolean)
      .join(', ') || 'General';
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!testId || !currentTest) return;

    let formattedLiveUntil: string | null = null;
    if (publishStatus === 'published') {
      if (!liveUntil) {
        setFormError('Please select a "Live Until" expiration date');
        return;
      }
      formattedLiveUntil = new Date(liveUntil).toISOString();
    }

    // Merge backend question IDs with local ones (we represent all in UI, but send list of IDs we have)
    const validQuestionIds = questions.map(q => q.id);

    const success = await updateTest(testId, {
      status: publishStatus,
      live_until: formattedLiveUntil,
      questions: validQuestionIds
    });

    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Navigation Headers */}
      <div>
        <button onClick={() => navigate(`/test/${testId}/questions`)} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
          <ArrowLeft size={16} />
          <span>Back to Questions</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 800 }}>Preview & Publish Test</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Review test configurations, confirm MCQ content, and change status settings.
        </p>
      </div>

      {formError && (
        <div style={{
          background: 'var(--error-glow)',
          border: '1px solid var(--error-color)',
          color: 'var(--text-main)',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          textAlign: 'center'
        }}>
          {formError}
        </div>
      )}

      {/* Two Column Layout: Info/Settings (Left) vs Questions Preview (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Test Configuration & Publish form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Summary Panel */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
              Test Configuration
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <span style={{ fontWeight: 600 }}>{currentTest?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subject:</span>
                <span>{currentTest ? getSubjectName(currentTest.subject) : ''}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Topics:</span>
                <span style={{ textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentTest ? getTopicNames(currentTest.topics) : ''}>
                  {currentTest ? getTopicNames(currentTest.topics) : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Difficulty:</span>
                <span style={{ textTransform: 'capitalize' }}>{currentTest?.difficulty}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--panel-border)', paddingTop: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TIME</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-color)' }}>{currentTest?.total_time}m</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>QUESTIONS</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-color)' }}>{questions.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MARKS</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-color)' }}>{currentTest?.total_marks}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--panel-border)', paddingTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>Marking Scheme:</span>
                <span>+{currentTest?.correct_marks} Correct / -{currentTest?.wrong_marks} Incorrect</span>
              </div>
            </div>
          </div>

          {/* Publish Settings Form */}
          <form onSubmit={handlePublish} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px' }}>
              Publish Controls
            </h3>

            {/* Draft vs Published Toggle */}
            <div className="form-group">
              <label className="form-label">Status Mode</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${publishStatus === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setPublishStatus('draft')}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className={`btn ${publishStatus === 'published' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1 }}
                  onClick={() => setPublishStatus('published')}
                >
                  Publish Now
                </button>
              </div>
            </div>

            {/* Settings only shown when status is published */}
            {publishStatus === 'published' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.2s ease-out' }}>
                
                {/* Publish Mode */}
                <div className="form-group">
                  <label className="form-label">Publish Mode</label>
                  <select
                    className="form-select"
                    value={publishMode}
                    onChange={(e) => setPublishMode(e.target.value as any)}
                  >
                    <option value="now">Immediate Publish</option>
                    <option value="schedule">Schedule Publish</option>
                  </select>
                </div>

                {/* Expiration date picker */}
                <div className="form-group">
                  <label className="form-label">Live Until (Expiration Date)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={liveUntil}
                    onChange={(e) => setLiveUntil(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Confirm Actions */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              disabled={isLoading}
            >
              <Send size={18} />
              <span>
                {publishStatus === 'published' ? 'Publish Test now' : 'Save draft changes'}
              </span>
            </button>
          </form>

        </div>

        {/* Right Column: Questions Preview Scroll panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Questions List</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>({questions.length} total)</span>
          </h3>

          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No questions added yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {questions.map((q, idx) => (
                <div key={q.id} style={{ 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--panel-border)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--primary-color)' }}>Question {idx + 1}</span>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{q.difficulty}</span>
                  </div>

                  <div 
                    style={{ fontSize: '14px', color: 'var(--text-main)' }} 
                    dangerouslySetInnerHTML={{ __html: q.question }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div style={{ 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      background: q.correct_option === 'option1' ? 'var(--success-glow)' : 'transparent',
                      border: q.correct_option === 'option1' ? '1px solid var(--success-color)' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      A: {q.option1}
                    </div>
                    <div style={{ 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      background: q.correct_option === 'option2' ? 'var(--success-glow)' : 'transparent',
                      border: q.correct_option === 'option2' ? '1px solid var(--success-color)' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      B: {q.option2}
                    </div>
                    <div style={{ 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      background: q.correct_option === 'option3' ? 'var(--success-glow)' : 'transparent',
                      border: q.correct_option === 'option3' ? '1px solid var(--success-color)' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      C: {q.option3}
                    </div>
                    <div style={{ 
                      padding: '8px 12px', 
                      borderRadius: '4px', 
                      background: q.correct_option === 'option4' ? 'var(--success-glow)' : 'transparent',
                      border: q.correct_option === 'option4' ? '1px solid var(--success-color)' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      D: {q.option4}
                    </div>
                  </div>

                  {q.explanation && (
                    <div style={{ 
                      background: 'rgba(255,255,255,0.01)', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      borderTop: '1px solid rgba(255,255,255,0.03)',
                      color: 'var(--text-muted)'
                    }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Solution Explanation:</span>
                      <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default PreviewPublish;
