export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const getToken = () => localStorage.getItem('careerli_token');

export async function apiRequest<T>(path: string, method: ApiMethod = 'GET', body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
