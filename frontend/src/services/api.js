// services/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Méthode pour récupérer le token de manière sécurisée
  getAuthToken() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('studentToken');
      }
      return null;
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return null;
    }
  }

  // Méthode pour supprimer un token invalide
  clearAuthToken() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('studentToken');
      }
    } catch (error) {
      console.warn('Unable to clear localStorage:', error);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Ajouter le token seulement s'il existe et n'est pas vide
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`Making request to: ${url}`);
      const response = await fetch(url, config);
      
      // Vérifier si la réponse est OK avant de parser le JSON
      if (!response.ok) {
        // Si le token est invalide (401), le supprimer
        if (response.status === 401) {
          console.warn('Token expired or invalid, clearing token');
          this.clearAuthToken();
        }

        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          // Si on ne peut pas parser la réponse d'erreur, utiliser le message par défaut
          console.warn('Could not parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data);
      return data;

    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Si c'est une erreur réseau ou de parsing
      if (error instanceof TypeError) {
        throw new Error('Erreur de connexion réseau. Vérifiez votre connexion internet.');
      }
      
      // Gestion spécifique des erreurs de token côté serveur
      const errorMessage = error.message || '';
      if (errorMessage.includes('cannot access local variable \'token\'') || 
          errorMessage.includes('token') || 
          errorMessage.includes('not associated with a value')) {
        console.warn('Server-side token error detected, clearing local token');
        this.clearAuthToken();
        throw new Error('Erreur d\'authentification côté serveur. Veuillez vous reconnecter.');
      }
      
      // Autres erreurs serveur
      if (errorMessage.includes('Erreur serveur:')) {
        throw new Error('Erreur interne du serveur. Veuillez réessayer plus tard.');
      }
      
      throw error;
    }
  }

  // Authentication
  async login(studentId, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          password: password,
        }),
      });
      
      if (response.token) {
        try {
          localStorage.setItem('studentToken', response.token);
        } catch (error) {
          console.warn('Could not save token to localStorage:', error);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async adminLogin(email, password) {
    try {
      const response = await this.request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      
      if (response.token) {
        try {
          localStorage.setItem('adminToken', response.token);
        } catch (error) {
          console.warn('Could not save token to localStorage:', error);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async enseignantLogin(email, password) {
    try {
      const response = await this.request('/auth/enseignant/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      
      if (response.token) {
        try {
          localStorage.setItem('enseignantToken', response.token);
        } catch (error) {
          console.warn('Could not save token to localStorage:', error);
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const response = await this.request('/auth/logout', {
        method: 'POST',
      });
      
      // Toujours supprimer le token local après logout
      this.clearAuthToken();
      
      return response;
    } catch (error) {
      // Même en cas d'erreur, supprimer le token local
      this.clearAuthToken();
      throw error;
    }
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

  // Méthode utilitaire pour vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = this.getAuthToken();
    return token && token.trim() !== '';
  }

  async getStudentSignature(studentId) {
    return this.request(`/student/${studentId}/signature`);
  }
}

export const apiService = new ApiService();
export default apiService;