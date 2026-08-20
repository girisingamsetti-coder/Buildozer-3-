/**
 * Standardised API response types.
 *
 * Every API route should return one of these shapes so clients can
 * handle success/error uniformly.
 */

/** Successful single-resource response */
export interface ApiSuccessResponse<T> {
  data: T
}

/** Successful paginated response */
export interface ApiPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

/** Error response body */
export interface ApiErrorResponse {
  error: string
  field?: string
  details?: Record<string, string>
}

/** Union type for any API response */
export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiPaginatedResponse<T>
  | ApiErrorResponse
