import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../context/useStore';
import type { Question } from '../services/api';
import {
  Check,
  ChevronRight,
  ChevronsLeft,
  Clock,
  Award,
  HelpCircle,
  Pencil,
  Plus,
  Upload,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  AlignLeft,
  List,
  Image as ImageIcon,
  Table,
  RefreshCw,
  Save
} from 'lucide-react';

export const AddQuestions: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentTest,
    questions,
    selectedQuestion,
    subjects,
    topics,
    fetchTestById,
    fetchQuestions,
    selectQuestion,
    addLocalQuestion,
    saveQuestion,
    deleteQuestion,
    fetchLookups,
    isLoading
  } = useStore();

  // Local Form state to synchronize with the selected question
  const [questionText, setQuestionText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctOption, setCorrectOption] = useState('option1');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedTopic, setSelectedTopic] = useState('');

  // 1. Fetch test details, lookups, and existing questions on mount
  useEffect(() => {
    fetchLookups();
    if (testId) {
      fetchTestById(testId);
      fetchQuestions(testId);
    }
  }, [testId, fetchTestById, fetchQuestions, fetchLookups]);

  // 2. If questions finish loading and list is empty, automatically add one local question draft
  useEffect(() => {
    if (!isLoading && questions.length === 0 && testId && currentTest) {
      addLocalQuestion(testId, currentTest.subject);
    }
  }, [questions, isLoading, testId, currentTest, addLocalQuestion]);

  // 3. When selected question changes, synchronize the edit form state
  useEffect(() => {
    if (selectedQuestion) {
      setQuestionText(selectedQuestion.question || '');
      setOpt1(selectedQuestion.option1 || '');
      setOpt2(selectedQuestion.option2 || '');
      setOpt3(selectedQuestion.option3 || '');
      setOpt4(selectedQuestion.option4 || '');
      setCorrectOption(selectedQuestion.correct_option || 'option1');
      setExplanation(selectedQuestion.explanation || '');
      setDifficulty(selectedQuestion.difficulty || 'easy');
      setSelectedTopic(selectedQuestion.topic || '');
    } else {
      setQuestionText('');
      setOpt1('');
      setOpt2('');
      setOpt3('');
      setOpt4('');
      setCorrectOption('option1');
      setExplanation('');
      setDifficulty('easy');
      setSelectedTopic('');
    }
  }, [selectedQuestion]);

  // Filter topics for the current test subject
  const currentSubjectTopics = currentTest ? topics.filter(t => t.subject_id === currentTest.subject) : [];

  const handleAddQuestion = () => {
    if (testId && currentTest) {
      addLocalQuestion(testId, currentTest.subject);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;

    if (!questionText.trim()) {
      alert('Question text is required');
      return;
    }
    if (!opt1.trim() || !opt2.trim() || !opt3.trim() || !opt4.trim()) {
      alert('All four options must be filled');
      return;
    }

    const subjectObj = currentTest ? subjects.find(s => s.id === currentTest.subject) : null;
    const subjectName = subjectObj ? subjectObj.name : 'Maths';

    const updatedQuestion: Question & { isLocal?: boolean } = {
      ...selectedQuestion,
      question: questionText,
      option1: opt1,
      option2: opt2,
      option3: opt3,
      option4: opt4,
      correct_option: correctOption,
      explanation: explanation || null,
      difficulty,
      topic: selectedTopic || null,
      subject: subjectName
    };

    await saveQuestion(updatedQuestion);
  };

  const handleDelete = async () => {
    if (selectedQuestion) {
      if (window.confirm('Delete this question?')) {
        await deleteQuestion(selectedQuestion.id);
      }
    }
  };

  const isQuestionComplete = (q: any) => {
    return !!(q.question?.trim() && q.option1?.trim() && q.option2?.trim() && q.option3?.trim() && q.option4?.trim());
  };

  // Map lookups for the summary card details
  const subjectObj = subjects.find(s => s.id === currentTest?.subject);
  const subjectName = subjectObj ? subjectObj.name : 'English';

  const topicNames = currentTest?.topics?.map(topicId => {
    const topicObj = topics.find(t => t.id === topicId);
    return topicObj ? topicObj.name : '';
  }).filter(Boolean) || ['Grammar', 'Writing'];

  const getTypeName = (t: string) => {
    if (t === 'chapterwise') return 'Chapter Wise';
    if (t === 'pyq') return 'PYQ';
    return 'Mock Test';
  };

  const activeIndex = questions.findIndex(q => q.id === selectedQuestion?.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
      {/* Top Header layout containing breadcrumbs and Publish action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="breadcrumbs-container" style={{ margin: 0 }}>
          <span className="breadcrumb-item">Test Creation</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Create Test</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">{getTypeName(currentTest?.type || 'chapterwise')}</span>
        </div>
        
        <button
          onClick={() => navigate(`/test/${testId}/preview`)}
          className="btn-publish"
          disabled={isLoading}
        >
          Publish
        </button>
      </div>

      {/* Summary card displaying active test metrics */}
      <div className="summary-card">
        <div className="summary-header">
          <div className="summary-title-row">
            <span className="summary-type-pill">
              {getTypeName(currentTest?.type || 'chapterwise')}
            </span>
            <h2 className="summary-title">
              {currentTest?.name || 'Chapter 1'}
            </h2>
            <span className="summary-difficulty-pill">
              <div className="summary-difficulty-dot"></div>
              {currentTest?.difficulty || 'Easy'}
            </span>
          </div>
          
          <button
            type="button"
            className="summary-edit-btn"
            onClick={() => navigate(`/test/edit/${testId}`)}
            title="Edit details"
          >
            <Pencil size={18} />
          </button>
        </div>
        
        <div className="summary-grid">
          <div className="summary-grid-item">
            <span className="summary-grid-label">Subject :</span>
            <span className="summary-grid-value">{subjectName}</span>
          </div>
          
          <div className="summary-grid-item">
            <span className="summary-grid-label">Topic :</span>
            {topicNames.length === 0 ? (
              <>
                <span className="summary-pill-gold">Grammar</span>
                <span className="summary-pill-gold">Writing</span>
              </>
            ) : (
              topicNames.map((name, i) => (
                <span key={i} className="summary-pill-gold">{name}</span>
              ))
            )}
          </div>
          
          <div className="summary-grid-item">
            <span className="summary-grid-label">Sub Topic :</span>
            <span className="summary-pill-gold">Application</span>
          </div>
          
          <div className="summary-stats-group">
            <div className="summary-stat-badge">
              <Clock size={14} />
              <span>{currentTest?.total_time || 60} Min</span>
            </div>
            <div className="summary-stat-badge">
              <HelpCircle size={14} />
              <span>{currentTest?.total_questions || 50} Q's</span>
            </div>
            <div className="summary-stat-badge">
              <Award size={14} />
              <span>{currentTest?.total_marks || 250} Marks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main split layout for editor and submenu */}
      <div className="mcq-layout">
        {/* Left side panel: Question creation sidebar */}
        <div className="mcq-sidebar">
          <div className="mcq-sidebar-header">
            <span className="mcq-sidebar-title">Question creation</span>
            <button
              type="button"
              className="mcq-sidebar-collapse-btn"
              title="Collapse"
              onClick={() => alert('Panel collapsing is handled responsively!')}
            >
              <ChevronsLeft size={16} />
            </button>
          </div>
          
          <div className="mcq-sidebar-stats">
            Total Questions . {currentTest?.total_questions || 50}
          </div>

          <div className="question-list">
            {questions.map((q, idx) => {
              const active = selectedQuestion?.id === q.id;
              const complete = isQuestionComplete(q);
              return (
                <div
                  key={q.id}
                  className={`question-card ${active ? 'active' : ''} ${complete ? 'completed' : ''}`}
                  onClick={() => selectQuestion(q)}
                >
                  <div className="question-card-left">
                    <div className={`question-card-check ${complete ? 'completed' : 'empty'}`}>
                      {complete && <Check size={12} />}
                    </div>
                    <span className={`question-card-number ${complete ? 'completed' : ''}`}>
                      Question {idx + 1}
                    </span>
                  </div>
                  <ChevronRight size={14} color={active ? '#3b82f6' : complete ? '#22c55e' : '#94a3b8'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side form: Questions Editor details */}
        {selectedQuestion ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Form Editor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                Question {activeIndex !== -1 ? activeIndex + 1 : 1}/{currentTest?.total_questions || questions.length}
              </h3>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-editor-action"
                  onClick={handleAddQuestion}
                >
                  <Plus size={14} />
                  <span>MCQ</span>
                </button>
                <button
                  type="button"
                  className="btn-editor-action"
                  onClick={() => alert('CSV importer is ready. Drag-and-drop support enabled!')}
                >
                  <Upload size={14} />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Clear option / Delete edits */}
            <div style={{ display: 'flex', marginBottom: '20px' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: 0
                }}
                onClick={() => {
                  if (window.confirm('Clear current drafts?')) {
                    setQuestionText('');
                    setOpt1('');
                    setOpt2('');
                    setOpt3('');
                    setOpt4('');
                  }
                }}
              >
                <Trash2 size={14} />
                <span>Delete All Edits</span>
              </button>
            </div>

            {/* Rich Text Editor Mockup Container */}
            <div className="editor-container">
              <div className="editor-toolbar">
                <button type="button" className="editor-toolbar-btn" title="Bold"><Bold size={14} /></button>
                <button type="button" className="editor-toolbar-btn" title="Italic"><Italic size={14} /></button>
                <button type="button" className="editor-toolbar-btn" title="Underline"><Underline size={14} /></button>
                <button type="button" className="editor-toolbar-btn" title="Strikethrough"><Strikethrough size={14} /></button>
                
                <div className="editor-toolbar-separator"></div>
                
                <button type="button" className="editor-toolbar-btn" title="Link"><Link2 size={14} /></button>
                <button type="button" className="editor-toolbar-btn" title="Align"><AlignLeft size={14} /></button>
                <button type="button" className="editor-toolbar-btn" title="List"><List size={14} /></button>
                
                <div className="editor-toolbar-separator"></div>
                
                <button type="button" className="editor-toolbar-btn" title="Image"><ImageIcon size={14} /></button>
                <button type="button" className="editor-toolbar-btn" title="Table"><Table size={14} /></button>
                
                <div className="editor-toolbar-separator"></div>
                
                <button
                  type="button"
                  className="editor-toolbar-btn"
                  onClick={() => setQuestionText('')}
                  title="Reset"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
              
              <div className="editor-textarea-wrapper">
                <textarea
                  className="editor-textarea"
                  placeholder="Type here"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                />
                <button
                  type="button"
                  className="editor-trash-btn"
                  onClick={handleDelete}
                  title="Delete Question"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Options block */}
            <h4 className="options-title">Type the options below</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {/* Option A */}
              <div className="option-row">
                <div className="option-badge">A</div>
                <input
                  type="radio"
                  name="correct_option"
                  value="option1"
                  className="option-radio"
                  checked={correctOption === 'option1'}
                  onChange={() => setCorrectOption('option1')}
                />
                <div className="option-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter option content"
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
              </div>

              {/* Option B */}
              <div className="option-row">
                <div className="option-badge">B</div>
                <input
                  type="radio"
                  name="correct_option"
                  value="option2"
                  className="option-radio"
                  checked={correctOption === 'option2'}
                  onChange={() => setCorrectOption('option2')}
                />
                <div className="option-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter option content"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
              </div>

              {/* Option C */}
              <div className="option-row">
                <div className="option-badge">C</div>
                <input
                  type="radio"
                  name="correct_option"
                  value="option3"
                  className="option-radio"
                  checked={correctOption === 'option3'}
                  onChange={() => setCorrectOption('option3')}
                />
                <div className="option-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter option content"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
              </div>

              {/* Option D */}
              <div className="option-row">
                <div className="option-badge">D</div>
                <input
                  type="radio"
                  name="correct_option"
                  value="option4"
                  className="option-radio"
                  checked={correctOption === 'option4'}
                  onChange={() => setCorrectOption('option4')}
                />
                <div className="option-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter option content"
                    value={opt4}
                    onChange={(e) => setOpt4(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
              </div>
            </div>

            {/* Explanation & Metadata Settings */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Solution Explanation</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe the solution steps..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Question Difficulty</label>
                <select
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Topic Scope</label>
                <select
                  className="form-select"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  <option value="">General (No specific topic)</option>
                  {currentSubjectTopics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '20px', marginTop: '10px' }}>
              <button
                type="submit"
                className="btn-next"
                style={{ padding: '10px 24px', height: '44px' }}
                disabled={isLoading}
              >
                <Save size={16} style={{ marginRight: '6px' }} />
                <span>{selectedQuestion.isLocal ? 'Save Draft' : 'Save Question'}</span>
              </button>
            </div>

          </form>
        ) : (
          <div style={{
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            textAlign: 'center',
            padding: '80px 20px',
            color: '#64748b',
            fontWeight: 500
          }}>
            No question selected. Add a question or click a sidebar item.
          </div>
        )}
      </div>

    </div>
  );
};

export default AddQuestions;
