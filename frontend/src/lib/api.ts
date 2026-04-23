// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hunt-x-production-2954.up.railway.app';

// Store token in memory (or localStorage for persistence)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem('token', token);
  } else if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const apiClient = {
  baseURL: API_BASE_URL,

  // Authentication
  async register(email: string, password: string, name?: string) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async getCurrentUser() {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  async uploadResume(email: string, file: File) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    return res.json();
  },

  async analyzeResume(resumeId: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ resume_id: resumeId }),
    });
    return res.json();
  },

  async generateCV(resumeId: string, jobTitle: string, company: string, jobDescription: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/cv/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        resume_id: resumeId,
        job_title: jobTitle,
        company: company,
        job_description: jobDescription,
      }),
    });
    return res.json();
  },

  async getUserCVs(userId: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/cv/user/${userId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return res.json();
  },

  async downloadCV(cvId: string) {
    window.open(`${API_BASE_URL}/api/cv/${cvId}/download`, '_blank');
  },

  async checkPaymentStatus(email: string) {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/payment/status/${email}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return res.json();
  },
};
