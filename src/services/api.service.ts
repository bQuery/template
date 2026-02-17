/**
 * @module ApiService
 * Base HTTP service that wraps the Fetch API with JSON defaults,
 * automatic authorisation-header injection, and typed error handling.
 *
 * Extend or compose this class for domain-specific API clients.
 */

import { ApiError, type ApiResponse } from '@/types';

/**
 * Generic HTTP service with convenience wrappers for common verbs.
 *
 * @example
 * ```ts
 * import { apiService } from "@/services/api.service";
 *
 * const users = await apiService.get<User[]>("/users");
 * ```
 */
class ApiService {
  /** Base URL prepended to every request endpoint. */
  protected readonly baseUrl: string;

  /** Token used for the `Authorization` header. */
  private authToken: string | null = null;

  /**
   * @param baseUrl - Root URL for all API requests (e.g. `"/api"`).
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  // -----------------------------------------------------------------------
  // Auth helpers
  // -----------------------------------------------------------------------

  /**
   * Set the bearer token that will be attached to every subsequent request.
   *
   * @param token - JWT or other bearer token. Pass `null` to clear.
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // -----------------------------------------------------------------------
  // Internal request handling
  // -----------------------------------------------------------------------

  /**
   * Execute a fetch request and return a typed {@link ApiResponse}.
   *
   * @typeParam T       - Expected shape of `response.data`.
   * @param endpoint    - Path appended to {@link baseUrl}.
   * @param options     - Standard `RequestInit` overrides.
   * @returns Parsed API response.
   * @throws {ApiError} When the response status is outside the 2xx range.
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number; message?: string }> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let details: Record<string, unknown> | undefined;
      try {
        details = (await response.json()) as Record<string, unknown>;
      } catch {
        /* response body may not be JSON */
      }

      throw new ApiError(
        response.statusText || `Request failed with status ${response.status}`,
        response.status,
        details
      );
    }

    const data = (await response.json()) as T;

    return {
      data,
      status: response.status,
      message: response.statusText,
    };
  }

  // -----------------------------------------------------------------------
  // Public convenience methods
  // -----------------------------------------------------------------------

  /**
   * Perform a `GET` request.
   *
   * @typeParam T    - Expected response payload type.
   * @param endpoint - Path relative to {@link baseUrl}.
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * Perform a `POST` request with a JSON body.
   *
   * @typeParam T    - Expected response payload type.
   * @param endpoint - Path relative to {@link baseUrl}.
   * @param body     - Payload to serialise as JSON.
   */
  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Perform a `PUT` request with a JSON body.
   *
   * @typeParam T    - Expected response payload type.
   * @param endpoint - Path relative to {@link baseUrl}.
   * @param body     - Payload to serialise as JSON.
   */
  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * Perform a `DELETE` request.
   *
   * @typeParam T    - Expected response payload type.
   * @param endpoint - Path relative to {@link baseUrl}.
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Pre-instantiated singleton API service pointed at `/api`.
 * Import this directly instead of creating new instances.
 */
export const apiService = new ApiService('/api');
