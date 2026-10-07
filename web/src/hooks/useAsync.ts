import { useCallback, useEffect, useRef, useState } from 'react'
import { isAbort } from '../api/client'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; error: Error }

export type AsyncResult<T> = {
  state: AsyncState<T>
  reload: () => void
}

/** An answer, tagged with the request it belongs to. */
type Settled<T> = { id: string; state: AsyncState<T> }

/**
 * Runs an async loader and tracks its state, aborting the in-flight request
 * on unmount and on reload.
 *
 * `key` names what the request depends on: change it and the loader runs
 * again. The loader is held in a ref rather than listed as a dependency, so an
 * inline arrow function — a new identity on every render — cannot cause a
 * refetch loop; that makes the key load-bearing, and it must capture
 * everything the loader closes over.
 *
 * "Loading" is derived during render from the request id, not set from inside
 * the effect, so it is already correct on the render that starts the request.
 *
 * The abort matters under <StrictMode>, which mounts effects twice in
 * development; without it the first response would race the second.
 */
export function useAsync<T>(
  load: (signal: AbortSignal) => Promise<T>,
  key: string,
): AsyncResult<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  const requestId = `${key}#${attempt}`

  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    const controller = new AbortController()
    const id = requestId

    loadRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setSettled({ id, state: { status: 'ready', data } })
        }
      })
      .catch((error: unknown) => {
        // An abort is our own cancellation, not a failure worth showing.
        if (controller.signal.aborted || isAbort(error)) return
        setSettled({
          id,
          state: {
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          },
        })
      })

    return () => controller.abort()
  }, [requestId])

  const reload = useCallback(() => setAttempt((count) => count + 1), [])

  // A request whose answer has not arrived yet is, by definition, loading.
  const state: AsyncState<T> =
    settled !== null && settled.id === requestId
      ? settled.state
      : { status: 'loading' }

  return { state, reload }
}
