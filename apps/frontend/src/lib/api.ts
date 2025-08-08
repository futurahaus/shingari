class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  private async getAccessToken(): Promise<string | null> {
    return localStorage.getItem('accessToken');
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) throw new Error('Failed to refresh token');

      const data = await response.json();
      
      // Update both tokens and user data in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Dispatch custom event to notify AuthContext of token update
      window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
        detail: { 
          accessToken: data.accessToken, 
          refreshToken: data.refreshToken, 
          user: data.user 
        } 
      }));
      
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear auth data on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Dispatch event to notify AuthContext of logout
      window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
      
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;

    // Add default headers
    const headers = new Headers(fetchOptions.headers);
    headers.set('Content-Type', 'application/json');

    const accessToken = await this.getAccessToken();

    headers.set('Authorization', `Bearer ${accessToken}`);

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    // Handle 401 with token refresh
    if (response.status === 401) {
      const newAccessToken = await this.refreshToken();

      if (newAccessToken) {
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
          credentials: 'include',
        });

        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }

        // Handle 204 No Content for retry response
        if (retryResponse.status === 204) {
          return {} as T;
        }
        return retryResponse.json();
      }

      window.location.href = '/';
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      // Try to parse error response, but handle empty responses gracefully
      let errorData = {};
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch {
        // If parsing fails, use empty object
        errorData = {};
      }
      
      throw {
        response: {
          status: response.status,
          data: errorData
        }
      };
    }

    // Handle 204 No Content - no response body to parse
    if (response.status === 204) {
      return {} as T;
    }

    // Handle 200 OK with empty body
    if (response.status === 200) {
      const text = await response.text();
      if (!text) return {} as T;
      try {
        return JSON.parse(text);
      } catch {
        // If JSON parsing fails, return empty object
        return {} as T;
      }
    }

    // For other status codes, try to parse JSON
    try {
      return await response.json();
    } catch {
      // If JSON parsing fails, return empty object
      return {} as T;
    }
  }

  // HTTP method wrappers
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();