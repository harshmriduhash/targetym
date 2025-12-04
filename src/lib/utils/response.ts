export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: unknown }

export function successResponse<T>(data: T): ActionResponse<T> {
  return { success: true, data }
}

export function errorResponse(
  error: string,
  code?: string,
  details?: unknown
): ActionResponse<never> {
  return { success: false, error, code, details }
}
