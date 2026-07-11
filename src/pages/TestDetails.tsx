import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/useStore';
import type { Test } from '../services/api';

interface SpinnerProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  prefixPlus?: boolean;
  disabled?: boolean;
}

const NumberSpinner: React.FC<SpinnerProps> = ({ label, value, onChange, prefixPlus = false, disabled = false }) => {
  const formattedValue = value > 0 && prefixPlus ? `+${value}` : value === 0 && prefixPlus ? `+0` : `${value}`;

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '0 16px',
        height: '48px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}>
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', flex: 1 }}>
          {formattedValue}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            type="button"
            onClick={() => !disabled && onChange(value + 1)}
            disabled={disabled}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 5L5 1L9 5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => !disabled && onChange(value - 1)}
            disabled={disabled}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const TestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const {
    subjects,
    topics,
    currentTest,
    fetchLookups,
    fetchTestById,
    createTest,
    updateTest,
    isLoading
  } = useStore();

  // Form Fields State
  const [name, setName] = useState('');
  const [type, setType] = useState<'chapterwise' | 'mock' | 'pyq'>('chapterwise');
  const [subject, setSubject] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [correctMarks, setCorrectMarks] = useState<number>(5); // default matching figma '+5'
  const [wrongMarks, setWrongMarks] = useState<number>(-1); // default matching figma '-1'
  const [unattemptMarks, setUnattemptMarks] = useState<number>(0); // default matching figma '+0'
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy'); // default matching figma 'easy'
  const [totalTime, setTotalTime] = useState<number>(60);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [totalMarks, setTotalMarks] = useState<number>(50);

  const [formError, setFormError] = useState('');

  // Fetch subjects & topics lookups on mount
  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  // Load existing test details if in Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchTestById(id);
    } else {
      // Clear fields for creation mode
      setName('');
      setType('chapterwise');
      setSubject('');
      setSelectedTopics([]);
      setCorrectMarks(5);
      setWrongMarks(-1);
      setUnattemptMarks(0);
      setDifficulty('easy');
      setTotalTime(60);
      setTotalQuestions(10);
      setTotalMarks(50);
    }
  }, [isEditMode, id, fetchTestById]);

  // Sync state once currentTest details are loaded in edit mode
  useEffect(() => {
    if (isEditMode && currentTest && currentTest.id === id && subjects.length > 0) {
      setName(currentTest.name);
      setType(currentTest.type);

      // Find subject by name or id
      const foundSub = subjects.find(s => s.name === currentTest.subject || s.id === currentTest.subject);
      const subId = foundSub ? foundSub.id : currentTest.subject;
      setSubject(subId);

      // Find topics by name or id
      const topicIds = (currentTest.topics || []).map(tName => {
        const foundTop = topics.find(t => t.name === tName || t.id === tName);
        return foundTop ? foundTop.id : tName;
      });
      setSelectedTopics(topicIds);

      setCorrectMarks(currentTest.correct_marks);
      setWrongMarks(currentTest.wrong_marks);
      setUnattemptMarks(currentTest.unattempt_marks);
      setDifficulty(currentTest.difficulty);
      setTotalTime(currentTest.total_time);
      setTotalQuestions(currentTest.total_questions);
      setTotalMarks(currentTest.total_marks);
    }
  }, [currentTest, isEditMode, id, subjects, topics]);

  // Filter topics belonging to the selected subject
  const filteredTopics = topics.filter(t => t.subject_id === subject);

  // When subject changes, reset selected topics
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubject(e.target.value);
    setSelectedTopics([]);
  };

  // Helper to auto-calculate marks
  useEffect(() => {
    if (correctMarks && totalQuestions) {
      setTotalMarks(correctMarks * totalQuestions);
    }
  }, [correctMarks, totalQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!name.trim()) {
      setFormError('Test name is required');
      return;
    }
    if (!subject) {
      setFormError('Subject selection is required');
      return;
    }
    if (selectedTopics.length === 0) {
      setFormError('Select a topic');
      return;
    }
    if (totalTime <= 0) {
      setFormError('Duration must be a positive number');
      return;
    }
    if (totalQuestions <= 0) {
      setFormError('Total questions must be a positive number');
      return;
    }

    const payload: Partial<Test> = {
      name: name.trim(),
      type,
      subject,
      topics: selectedTopics,
      correct_marks: Number(correctMarks),
      wrong_marks: Number(wrongMarks),
      unattempt_marks: Number(unattemptMarks),
      difficulty,
      total_time: Number(totalTime),
      total_questions: Number(totalQuestions),
      total_marks: Number(totalMarks),
      status: isEditMode && currentTest ? currentTest.status : 'draft',
      questions: isEditMode && currentTest && currentTest.questions ? currentTest.questions : []
    };

    if (isEditMode && id) {
      const success = await updateTest(id, payload);
      if (success) {
        navigate(`/test/${id}/questions`);
      }
    } else {
      const newTest = await createTest(payload);
      if (newTest && newTest.id) {
        navigate(`/test/${newTest.id}/questions`);
      }
    }
  };

  const getTypeName = (t: string) => {
    if (t === 'chapterwise') return 'Chapter Wise';
    if (t === 'pyq') return 'PYQ';
    return 'Mock Test';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
      {/* Breadcrumbs */}
      <div className="breadcrumbs-container">
        <span className="breadcrumb-item">Test Creation</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item">Create Test</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">{getTypeName(type)}</span>
      </div>

      {/* Tabs list */}
      <div className="type-tabs-container">
        <button
          type="button"
          className={`type-tab ${type === 'chapterwise' ? 'active' : ''}`}
          onClick={() => setType('chapterwise')}
          disabled={isLoading}
        >
          Chapterwise
        </button>
        <button
          type="button"
          className={`type-tab ${type === 'pyq' ? 'active' : ''}`}
          onClick={() => setType('pyq')}
          disabled={isLoading}
        >
          PYQ
        </button>
        <button
          type="button"
          className={`type-tab ${type === 'mock' ? 'active' : ''}`}
          onClick={() => setType('mock')}
          disabled={isLoading}
        >
          Mock Test
        </button>
      </div>

      {formError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fee2e2',
          color: '#ef4444',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {formError}
        </div>
      )}

      {/* Main Form Panel */}
      <form onSubmit={handleSubmit}>
        <div className="test-creation-grid">
          {/* Subject Selection */}
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={subject}
              onChange={handleSubjectChange}
              disabled={isLoading || isEditMode}
            >
              <option value="" disabled>Choose from Drop-down</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          {/* Name of Test */}
          <div className="form-group">
            <label className="form-label">Name of Test</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter name of Test"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Topic selection dropdown */}
          <div className="form-group">
            <label className="form-label">Topic</label>
            <select
              className="form-select"
              value={selectedTopics[0] || ''}
              onChange={(e) => setSelectedTopics([e.target.value])}
              disabled={isLoading || !subject}
            >
              <option value="" disabled>Choose from Drop-down</option>
              {filteredTopics.map(topic => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>

          {/* Sub Topic Selection */}
          <div className="form-group">
            <label className="form-label">Sub Topic</label>
            <select
              className="form-select"
              disabled={isLoading || !selectedTopics[0]}
              defaultValue=""
            >
              <option value="" disabled>Choose from Drop-down</option>
              {selectedTopics[0] && (
                <>
                  <option value="sub1">Introduction & Core Concepts</option>
                  <option value="sub2">Advanced Practice Problems</option>
                  <option value="sub3">Historical Exam Questions</option>
                </>
              )}
            </select>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label className="form-label">Duration (Minutes)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter the time"
              value={totalTime || ''}
              onChange={(e) => setTotalTime(Math.max(1, Number(e.target.value.replace(/\D/g, ''))))}
              disabled={isLoading}
            />
          </div>

          {/* Test Difficulty Level Custom Radios */}
          <div className="form-group">
            <label className="form-label">Test Difficulty Level</label>
            <div className="difficulty-radios-container">
              <label className="custom-radio-label">
                <input
                  type="radio"
                  name="difficulty"
                  value="easy"
                  className="custom-radio-input"
                  checked={difficulty === 'easy'}
                  onChange={() => setDifficulty('easy')}
                  disabled={isLoading}
                />
                <span>Easy</span>
              </label>
              <label className="custom-radio-label">
                <input
                  type="radio"
                  name="difficulty"
                  value="medium"
                  className="custom-radio-input"
                  checked={difficulty === 'medium'}
                  onChange={() => setDifficulty('medium')}
                  disabled={isLoading}
                />
                <span>Medium</span>
              </label>
              <label className="custom-radio-label">
                <input
                  type="radio"
                  name="difficulty"
                  value="hard"
                  className="custom-radio-input"
                  checked={difficulty === 'hard'}
                  onChange={() => setDifficulty('hard')}
                  disabled={isLoading}
                />
                <span>Difficult</span>
              </label>
            </div>
          </div>
        </div>

        {/* Marking Scheme Header */}
        <h2 className="marking-scheme-title">Marking Scheme:</h2>

        {/* Marking Scheme Parameters Grid */}
        <div className="marking-scheme-grid">
          <NumberSpinner
            label="Wrong Answer"
            value={wrongMarks}
            onChange={(val) => setWrongMarks(val)}
            disabled={isLoading}
          />

          <NumberSpinner
            label="Unattempted"
            value={unattemptMarks}
            onChange={(val) => setUnattemptMarks(val)}
            prefixPlus={true}
            disabled={isLoading}
          />

          <NumberSpinner
            label="Correct Answer"
            value={correctMarks}
            onChange={(val) => setCorrectMarks(val)}
            prefixPlus={true}
            disabled={isLoading}
          />

          <div className="form-group">
            <label className="form-label">No of Questions</label>
            <input
              type="number"
              className="form-input"
              placeholder="Ex:250 Marks"
              value={totalQuestions || ''}
              onChange={(e) => setTotalQuestions(Math.max(1, Number(e.target.value)))}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Marks</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex:250 Marks"
              value={totalMarks || ''}
              readOnly
              disabled={true}
              style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed', color: '#94a3b8' }}
            />
          </div>
        </div>

        {/* Form Footer Action Buttons */}
        <div className="form-footer-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/dashboard')}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-next"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestDetails;
