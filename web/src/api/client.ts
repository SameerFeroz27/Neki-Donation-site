/* =========================================================
   HTTP client.

   One place that knows how to talk to the API: base URL, headers, aborts and
   turning every failure into an ApiError with a message that is safe to show
   a person.
   ========================================================= */
import { API_BASE_URL } from '../config'

export class ApiError extends Error {
  /** HTTP status, or undefined when the request never reached the server. */
  readonly status: number | undefined

  constructor(message: string, status?: number, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ApiError'
    this.status = status
  }

  /** True when retrying could plausibly work (network blip or server fault). */
  get isRetryable(): boolean {
    return this.status === undefined || this.status >= 500
  }
}

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (cause) {
    if (isAbort(cause)) throw cause
    throw new ApiError('Could not reach the server.', undefined, { cause })
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? 'That data is not available yet.'
        : `The server responded with ${response.status}.`,
      response.status,
    )
  }

  try {
    return (await response.json()) as T
  } catch (cause) {
    throw new ApiError(
      'The server sent a response we could not read.',
      response.status,
      { cause },
    )
  }
}

/**
 * POST with a JSON body. Fails the same way apiGet does, so a caller never
 * has to care which verb failed.
 */
export async function apiPost<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch (cause) {
    if (isAbort(cause)) throw cause
    throw new ApiError('Could not reach the server.', undefined, { cause })
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 422
        ? 'The server rejected those details.'
        : `The server responded with ${response.status}.`,
      response.status,
    )
  }

  try {
    return (await response.json()) as T
  } catch (cause) {
    throw new ApiError(
      'The server sent a response we could not read.',
      response.status,
      { cause },
    )
  }
}
