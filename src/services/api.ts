import { Question, LeaderboardEntry } from '../types';

const API_BASE = '/api';

export const api = {
  getQuestions: async (): Promise<Question[]> => {
    const res = await fetch(`${API_BASE}/questions`);
    return res.json();
  },
  addQuestion: async (q: Omit<Question, 'id'>): Promise<Question> => {
    const res = await fetch(`${API_BASE}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    });
    return res.json();
  },
  updateQuestion: async (id: string, q: Partial<Question>): Promise<Question> => {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    });
    return res.json();
  },
  deleteQuestion: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/questions/${id}`, { method: 'DELETE' });
  },
  getLeaderboard: async (type: '22' | '45'): Promise<LeaderboardEntry[]> => {
    const res = await fetch(`${API_BASE}/leaderboard/${type}`);
    return res.json();
  },
  getLeaderboardStats: async (): Promise<{ mostExams: any[], highestAvg: any[] }> => {
    const res = await fetch(`${API_BASE}/leaderboard/stats`);
    return res.json();
  },
  submitScore: async (type: '22' | '45', entry: Omit<LeaderboardEntry, 'timestamp'>): Promise<LeaderboardEntry> => {
    const res = await fetch(`${API_BASE}/leaderboard/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    return res.json();
  },
};
