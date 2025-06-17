import { Case, SymptomSession, VitalsEntry, PatientProfile } from '../types';

class ApiService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const user = localStorage.getItem('virtudoc_user');
    if (user) {
      const userData = JSON.parse(user);
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${userData.id}`, // Mock token
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Symptom Sessions
  async createSymptomSession(data: Omit<SymptomSession, 'id' | 'createdAt'>): Promise<SymptomSession> {
    return this.request<SymptomSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSymptomSessions(patientId?: string): Promise<SymptomSession[]> {
    const query = patientId ? `?patientId=${patientId}` : '';
    return this.request<SymptomSession[]>(`/sessions${query}`);
  }

  async getSymptomSession(id: string): Promise<SymptomSession> {
    return this.request<SymptomSession>(`/sessions/${id}`);
  }

  async updateSymptomSession(id: string, data: Partial<SymptomSession>): Promise<SymptomSession> {
    return this.request<SymptomSession>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Vitals
  async createVitalsEntry(data: Omit<VitalsEntry, 'id' | 'createdAt'>): Promise<VitalsEntry> {
    return this.request<VitalsEntry>('/vitals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVitalsEntries(sessionId?: string): Promise<VitalsEntry[]> {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return this.request<VitalsEntry[]>(`/vitals${query}`);
  }

  // Cases
  async getCases(filters?: { status?: string; doctorId?: string }): Promise<Case[]> {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request<Case[]>(`/cases${query}`);
  }

  async getCase(id: string): Promise<Case> {
    return this.request<Case>(`/cases/${id}`);
  }

  async updateCase(id: string, data: Partial<Case>): Promise<Case> {
    return this.request<Case>(`/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Patient Profiles
  async getPatientProfile(id: string): Promise<PatientProfile> {
    return this.request<PatientProfile>(`/patients/${id}`);
  }

  async updatePatientProfile(id: string, data: Partial<PatientProfile>): Promise<PatientProfile> {
    return this.request<PatientProfile>(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // File Upload
  async uploadFile(file: File, type: 'image' | 'audio'): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('virtudoc_user') || '{}').id}`,
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  // AI Analysis
  async analyzeSymptoms(text: string, images?: string[]): Promise<{ analysis: string; entities: any[] }> {
    return this.request<{ analysis: string; entities: any[] }>('/ai/analyze-symptoms', {
      method: 'POST',
      body: JSON.stringify({ text, images }),
    });
  }

  async analyzeVitals(vitals: any, images?: string[]): Promise<{ analysis: string; urgency: string }> {
    return this.request<{ analysis: string; urgency: string }>('/ai/analyze-vitals', {
      method: 'POST',
      body: JSON.stringify({ vitals, images }),
    });
  }
}

export const apiService = new ApiService();