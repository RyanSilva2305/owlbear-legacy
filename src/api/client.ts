// Arquivo: owlbear-rodeo-legacy/src/api/client.ts

// Verifica se está no contexto de browser (não Web Worker)
const isBrowser = typeof window !== 'undefined';
const API_BASE = isBrowser && (window as any).OWLBEAR_CONFIG?.apiBase 
  ? (window as any).OWLBEAR_CONFIG.apiBase 
  : 'http://127.0.0.1:8000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Envia cookies de sessão
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // ==================== GAME/SESSION ====================
  
  async getSession(sessionId: string | number) {
    return this.request(`/owlbear/session?sessionId=${sessionId}`);
  }

  async createSession(sessaoId: number) {
    return this.request('/owlbear/session', {
      method: 'POST',
      body: JSON.stringify({ sessao_id: sessaoId }),
    });
  }

  // ==================== MAPS ====================
  
  async getMaps(gameId: string) {
    const result = await this.request(`/owlbear/maps?gameId=${gameId}`);
    return Array.isArray(result) ? result : [];
  }

  async createMap(data: any) {
    return this.request('/owlbear/maps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMap(id: string, data: any) {
    return this.request(`/owlbear/maps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMap(id: string) {
    return this.request(`/owlbear/maps/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== TOKENS ====================
  
  async getTokens(mapId: string) {
    const result = await this.request(`/owlbear/tokens?mapId=${mapId}`);
    return Array.isArray(result) ? result : [];
  }

  async createToken(data: any) {
    return this.request('/owlbear/tokens', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateToken(id: string, data: any) {
    return this.request(`/owlbear/tokens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteToken(id: string) {
    return this.request(`/owlbear/tokens/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE);