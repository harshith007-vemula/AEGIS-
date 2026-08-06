// API Client for AEGIS AI Gateway
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to attach authorization header
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('aegis_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Authentication
  auth: {
    async login(payload: any) {
      const data = await apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('aegis_token', data.token);
        localStorage.setItem('aegis_user', JSON.stringify(data.user));
      }
      return data;
    },
    async register(payload: any) {
      const data = await apiRequest<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('aegis_token', data.token);
        localStorage.setItem('aegis_user', JSON.stringify(data.user));
      }
      return data;
    },
    logout() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aegis_token');
        localStorage.removeItem('aegis_user');
      }
    },
    getCurrentUser() {
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('aegis_user');
        return u ? JSON.parse(u) : null;
      }
      return null;
    },
    async getMe() {
      return apiRequest<any>('/auth/me');
    }
  },

  // Incidents
  incidents: {
    async list() {
      return apiRequest<any[]>('/incidents');
    },
    async getById(id: string) {
      return apiRequest<any>(`/incidents/${id}`);
    },
    async create(payload: any) {
      return apiRequest<any>('/incidents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async orchestrate(id: string, payload: {
      imageBase64?: string;
      imageMimeType?: string;
      audioBase64?: string;
      audioMimeType?: string;
      documentText?: string;
    }) {
      return apiRequest<any>(`/incidents/${id}/orchestrate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async getReport(incidentId: string) {
      return apiRequest<any>(`/incidents/${incidentId}/report`);
    },
    async getReportsList() {
      return apiRequest<any[]>('/incidents/reports');
    },
    getPdfUrl(incidentId: string) {
      return `${API_URL}/incidents/pdf/${incidentId}`;
    }
  },

  // Agents
  agents: {
    async list() {
      return apiRequest<any[]>('/agents');
    },
    async reset() {
      return apiRequest<any>('/agents/reset', { method: 'POST' });
    }
  },

  // Resources, Vehicles, Hospitals, Logs
  resources: {
    async list() {
      return apiRequest<any[]>('/resources');
    },
    async listHospitals() {
      return apiRequest<any[]>('/resources/hospitals');
    },
    async listVehicles() {
      return apiRequest<any[]>('/resources/vehicles');
    },
    async listLogs() {
      return apiRequest<any[]>('/resources/logs');
    },
    async getStats() {
      return apiRequest<any>('/resources/stats');
    },
    async getNotifications() {
      return apiRequest<any[]>('/resources/notifications');
    },
    async markNotificationRead(id: string) {
      return apiRequest<any>(`/resources/notifications/${id}/read`, { method: 'POST' });
    }
  }
};
