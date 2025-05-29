interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
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
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear auth data on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requireAuth = false, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;

    // Add default headers
    const headers = new Headers(fetchOptions.headers);
    headers.set('Content-Type', 'application/json');

    // Add auth header if required
    if (requireAuth) {
      let accessToken = await this.getAccessToken();

      if (!accessToken) {
        accessToken = await this.refreshToken();
        if (!accessToken) {
          throw new Error('Authentication required');
        }
      }

      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    // Handle 401 with token refresh
    if (response.status === 401 && requireAuth) {
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
        return retryResponse.json();
      }
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // HTTP method wrappers
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T, D extends Record<string, unknown>>(
    endpoint: string,
    data: D,
    options: RequestOptions = {}
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
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();