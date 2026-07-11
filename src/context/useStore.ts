import { create } from 'zustand';
import { api } from '../services/api';
import type { Subject, Topic, Test, Question } from '../services/api';

interface Alert {
  message: string;
  type: 'success' | 'error' | 'warning' | null;
}

interface AppState {
  token: string | null;
  user: any | null;
  subjects: Subject[];
  topics: Topic[];
  tests: Test[];
  currentTest: Test | null;
  questions: (Question & { isLocal?: boolean })[];
  selectedQuestion: (Question & { isLocal?: boolean }) | null;
  isLoading: boolean;
  error: string | null;
  alert: Alert;
  
  // Actions
  setAlert: (message: string, type: Alert['type']) => void;
  clearAlert: () => void;
  login: (payload: any) => Promise<boolean>;
  logout: () => void;
  fetchLookups: () => Promise<void>;
  fetchTests: () => Promise<void>;
  fetchTestById: (id: string) => Promise<void>;
  createTest: (test: Partial<Test>) => Promise<Test | null>;
  updateTest: (id: string, test: Partial<Test>) => Promise<boolean>;
  deleteTest: (id: string) => Promise<boolean>;
  
  // Question Actions
  fetchQuestions: (testId: string) => Promise<void>;
  selectQuestion: (question: (Question & { isLocal?: boolean }) | null) => void;
  addLocalQuestion: (testId: string, subjectId: string) => void;
  saveQuestion: (question: Question & { isLocal?: boolean }) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  subjects: [],
  topics: [],
  tests: [],
  currentTest: null,
  questions: [],
  selectedQuestion: null,
  isLoading: false,
  error: null,
  alert: { message: '', type: null },

  setAlert: (message, type) => {
    set({ alert: { message, type } });
    setTimeout(() => get().clearAlert(), 4000);
  },
  
  clearAlert: () => set({ alert: { message: '', type: null } }),

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(payload);
      if (res.status === 'success' && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user || { userId: payload.userId }));
        set({ 
          token: res.data.token, 
          user: res.data.user || { userId: payload.userId },
          isLoading: false 
        });
        get().setAlert('Login successful!', 'success');
        return true;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Authentication failed';
      set({ error: errMsg, isLoading: false });
      get().setAlert(errMsg, 'error');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, tests: [], currentTest: null, questions: [] });
    get().setAlert('Logged out successfully', 'success');
  },

  fetchLookups: async () => {
    if (get().subjects.length > 0) return;
    try {
      const [subjects, topics] = await Promise.all([
        api.getSubjects(),
        api.getTopics()
      ]);
      set({ subjects, topics });
    } catch (err) {
      console.error('Failed to load lookups', err);
    }
  },

  fetchTests: async () => {
    set({ isLoading: true });
    try {
      const tests = await api.getTests();
      set({ tests, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
      get().setAlert('Failed to load tests', 'error');
    }
  },

  fetchTestById: async (id) => {
    set({ isLoading: true });
    try {
      const currentTest = await api.getTestById(id);
      set({ currentTest, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      get().setAlert('Failed to fetch test details', 'error');
    }
  },

  createTest: async (test) => {
    set({ isLoading: true });
    try {
      const newTest = await api.createTest(test);
      set({ currentTest: newTest, isLoading: false });
      get().setAlert('Test details saved successfully!', 'success');
      return newTest;
    } catch (err: any) {
      console.error('createTest error response:', err.response?.data || err);
      let errMsg = err.response?.data?.message || 'Failed to create test';
      if (err.response?.data?.errors) {
        const detail = err.response.data.errors.map((e: any) => `${e.path}: ${e.msg}`).join(', ');
        errMsg = `${errMsg} (${detail})`;
      }
      set({ isLoading: false });
      get().setAlert(errMsg, 'error');
      return null;
    }
  },

  updateTest: async (id, test) => {
    set({ isLoading: true });
    try {
      const updatedTest = await api.updateTest(id, test);
      set((state) => ({
        currentTest: updatedTest,
        tests: state.tests.map((t) => (t.id === id ? updatedTest : t)),
        isLoading: false
      }));
      get().setAlert('Test updated successfully!', 'success');
      return true;
    } catch (err: any) {
      console.error('updateTest error response:', err.response?.data || err);
      let errMsg = err.response?.data?.message || 'Failed to update test';
      if (err.response?.data?.errors) {
        const detail = err.response.data.errors.map((e: any) => `${e.path}: ${e.msg}`).join(', ');
        errMsg = `${errMsg} (${detail})`;
      }
      set({ isLoading: false });
      get().setAlert(errMsg, 'error');
      return false;
    }
  },

  deleteTest: async (id) => {
    try {
      await api.deleteTest(id);
      set((state) => ({
        tests: state.tests.filter((t) => t.id !== id)
      }));
      get().setAlert('Test deleted successfully!', 'success');
      return true;
    } catch (err: any) {
      get().setAlert('Failed to delete test', 'error');
      return false;
    }
  },

  fetchQuestions: async (testId) => {
    set({ isLoading: true });
    try {
      const questions = await api.getQuestions(testId);
      set({ 
        questions, 
        selectedQuestion: questions.length > 0 ? questions[0] : null,
        isLoading: false 
      });
    } catch (err) {
      set({ isLoading: false });
      get().setAlert('Failed to fetch questions', 'error');
    }
  },

  selectQuestion: (question) => {
    set({ selectedQuestion: question });
  },

  addLocalQuestion: (testId, subjectId) => {
    // Lookup subject name
    const subjectObj = get().subjects.find(s => s.id === subjectId);
    const subjectName = subjectObj ? subjectObj.name : 'General';
    
    const newQuestion: Question & { isLocal?: boolean } = {
      id: crypto.randomUUID(),
      type: 'mcq',
      question: 'New Multiple Choice Question',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_option: 'option1',
      explanation: '',
      difficulty: 'easy',
      paragraph: null,
      media_url: null,
      test_id: testId,
      subject: subjectName,
      isLocal: true
    };
    
    set((state) => ({
      questions: [...state.questions, newQuestion],
      selectedQuestion: newQuestion
    }));
    get().setAlert('Question draft added locally!', 'success');
  },

  saveQuestion: async (question) => {
    // If it's a backend question, save it to the backend
    if (!question.isLocal) {
      set({ isLoading: true });
      try {
        const updated = await api.updateQuestion(question.id, question);
        set((state) => ({
          questions: state.questions.map((q) => (q.id === question.id ? updated : q)),
          selectedQuestion: updated,
          isLoading: false
        }));
        get().setAlert('Question saved successfully to backend!', 'success');
      } catch (err: any) {
        set({ isLoading: false });
        get().setAlert('Failed to save question to server', 'error');
      }
    } else {
      // For local questions, just update them in the local list
      set((state) => ({
        questions: state.questions.map((q) => (q.id === question.id ? { ...question, isLocal: true } : q)),
        selectedQuestion: { ...question, isLocal: true }
      }));
      get().setAlert('Question draft updated locally!', 'success');
    }
  },

  deleteQuestion: async (id) => {
    const question = get().questions.find(q => q.id === id);
    if (!question) return;

    if (!question.isLocal) {
      set({ isLoading: true });
      try {
        await api.deleteQuestion(id);
        set((state) => {
          const nextQuestions = state.questions.filter((q) => q.id !== id);
          return {
            questions: nextQuestions,
            selectedQuestion: nextQuestions.length > 0 ? nextQuestions[0] : null,
            isLoading: false
          };
        });
        get().setAlert('Question deleted from server', 'success');
      } catch (err) {
        set({ isLoading: false });
        get().setAlert('Failed to delete question', 'error');
      }
    } else {
      // Local question
      set((state) => {
        const nextQuestions = state.questions.filter((q) => q.id !== id);
        return {
          questions: nextQuestions,
          selectedQuestion: nextQuestions.length > 0 ? nextQuestions[0] : null
        };
      });
      get().setAlert('Question draft removed', 'success');
    }
  }
}));
