/**
 * Shared API route utilities.
 *
 * Provides consistent response helpers and error handling so every
 * API route follows the same pattern.
 */

import { NextResponse } from 'next/server'

// ──────────────────── Response helpers ────────────────────

/**
 * Return a successful JSON response.
 *
 * @example
 *   return successResponse(worker, 201)
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

/**
 * Return a paginated JSON response.
 *
 * @example
 *   return paginatedResponse(workers, total, page, limit)
 */
export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return NextResponse.json({ data, total, page, limit })
}

/**
 * Return an error JSON response.
 *
 * @example
 *   return errorResponse('Not found', 404)
 *   return errorResponse('Validation failed', 400, 'email')
 */
export function errorResponse(message: string, status = 500, field?: string) {
  const body: Record<string, unknown> = { error: message }
  if (field) body.field = field
  return NextResponse.json(body, { status })
}

// ──────────────────── Error handler ────────────────────

/**
 * Log the error and return a standardised 500 response.
 * Use this in the catch block of every API route.
 *
 * @example
 *   catch (error) {
 *     return handleApiError(error, 'GET /api/workers')
 *   }
 */
export function handleApiError(error: unknown, context: string) {
  console.error(`${context} error:`, error)

  // Surface Prisma unique-constraint violations as a friendlier message
  const isPrismaUnique =
    error instanceof Error && error.message.includes('Unique')

  return errorResponse(
    isPrismaUnique ? 'A record with that value already exists' : 'Internal server error',
    500,
  )
}

// ──────────────────── Pagination parser ────────────────────

/**
 * Parse and clamp pagination query params.
 *
 * @example
 *   const { page, limit, skip } = parsePagination(searchParams)
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
