import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://admin-moderator-backend-staging.up.railway.app/api' 
  : '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export interface Subject {
  id: string;
  name: string;
  created_at?: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
  created_at?: string;
}

export interface Test {
  id?: string;
  name: string;
  type: 'chapterwise' | 'mock' | 'pyq';
  subject: string; // subject UUID
  topics: string[]; // array of topic UUIDs
  questions: string[] | null; // array of question UUIDs
  correct_marks: number;
  unattempt_marks: number;
  wrong_marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  total_marks: number;
  total_time: number; // in minutes
  total_questions: number;
  status: 'draft' | 'published';
  live_until?: string | null;
  created_by?: number;
  created_at?: string;
}

export interface Question {
  id: string;
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string; // e.g. 'option1'
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  paragraph: string | null;
  media_url: string | null;
  created_by?: number;
  created_at?: string;
  test_id: string;
  subject: string; // subject name or UUID
  topic?: string | null;
  sub_topic?: string | null;
}

export const api = {
  // Authentication
  async login(payload: any) {
    const res = await apiClient.post('/auth/login', payload);
    return res.data; // { status: 'success', message, data: { token, user: { ... } } }
  },

  // Subjects & Topics
  async getSubjects(): Promise<Subject[]> {
    const res = await apiClient.get('/subjects');
    return res.data.data;
  },

  async getTopics(): Promise<Topic[]> {
    const res = await apiClient.get('/topics');
    return res.data.data;
  },

  // Tests
  async getTests(): Promise<Test[]> {
    const res = await apiClient.get('/tests');
    return res.data.data;
  },

  async getTestById(id: string): Promise<Test> {
    const res = await apiClient.get(`/tests/${id}`);
    return res.data.data;
  },

  async createTest(test: Partial<Test>): Promise<Test> {
    const res = await apiClient.post('/tests', test);
    return res.data.data;
  },

  async updateTest(id: string, test: Partial<Test>): Promise<Test> {
    const res = await apiClient.put(`/tests/${id}`, test);
    return res.data.data;
  },

  async deleteTest(id: string): Promise<any> {
    const res = await apiClient.delete(`/tests/${id}`);
    return res.data;
  },

  // Questions
  async getQuestions(testId?: string): Promise<Question[]> {
    const res = await apiClient.get('/questions');
    let questions = res.data.data || [];
    if (testId) {
      questions = questions.filter((q: Question) => q.test_id === testId);
    }
    return questions;
  },

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    const res = await apiClient.put(`/questions/${id}`, question);
    return res.data.data;
  },

  async deleteQuestion(id: string): Promise<any> {
    const res = await apiClient.delete(`/questions/${id}`);
    return res.data;
  }
};
