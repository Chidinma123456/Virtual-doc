import { ApiResponse, PaginatedResponse } from '../types';

class ApiService {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaders(): HeadersInit {
    const accessToken = localStorage.getItem('accessToken');
    return {
      ...this.defaultHeaders,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP ${response.status}`);
    }
    
    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Specific API methods
  async createSession(data: any) {
    return this.post('/sessions', data);
  }

  async getSession(id: string) {
    return this.get(`/sessions/${id}`);
  }

  async updateSession(id: string, data: any) {
    return this.patch(`/sessions/${id}`, data);
  }

  async submitVitals(data: any) {
    return this.post('/vitals', data);
  }

  async getCases(params?: { status?: string; priority?: string; page?: number; limit?: number }) {
    return this.get('/cases', params);
  }

  async getCase(id: string) {
    return this.get(`/cases/${id}`);
  }

  async updateCase(id: string, data: any) {
    return this.patch(`/cases/${id}`, data);
  }

  async assignCase(id: string, doctorId: string) {
    return this.post(`/cases/${id}/assign`, { doctorId });
  }

  async createConsultation(data: any) {
    return this.post('/consultations', data);
  }

  async getNotifications() {
    return this.get('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.patch(`/notifications/${id}/read`);
  }

  async analyzeSymptoms(text: string, audioUrl?: string) {
    return this.post('/ai/analyze-symptoms', { text, audioUrl });
  }

  async analyzeImage(imageUrl: string) {
    return this.post('/ai/analyze-image', { imageUrl });
  }

  async generateAudioResponse(text: string, voiceId?: string) {
    return this.post('/ai/text-to-speech', { text, voiceId });
  }

  async createVideoConsultation(caseId: string) {
    return this.post('/video/create-room', { caseId });
  }
}

export const apiService = new ApiService();