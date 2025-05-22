// services/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async login(studentId, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        password: password,
      }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/student/profile');
  }

  // Test Management
  async getQuestions(field) {
    return this.request(`/questions/${field}`);
  }

  async submitTest(testData) {
    return this.request('/test/submit', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  // Surveillance
  async logSurveillanceAlert(alertData) {
    return this.request('/surveillance/alert', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }
}

export const apiService = new ApiService();
export default apiService;