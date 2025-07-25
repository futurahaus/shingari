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
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content - no response body to parse
    if (response.status === 204) {
      return {} as T;
    }

    // Handle 200 OK with empty body
    if (response.status === 200) {
      const text = await response.text();
      if (!text) return {} as T;
      return JSON.parse(text);
    }

    return response.json();
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