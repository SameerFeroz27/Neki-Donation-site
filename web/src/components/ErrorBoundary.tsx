import { Component, type ErrorInfo, type ReactNode } from 'react'
import { StateBlock } from './StateBlock'

type Props = { children: ReactNode; title?: string }
type State = { error: Error | null }

/**
 * Stops one broken component from blanking the whole page.
 *
 * Without this, a render error anywhere unmounts the entire React tree — the
 * header, hero and campaign grid all disappear and the user is left with a
 * white screen and no explanation. Found the hard way.
 *
 * A class is required: there is no hook equivalent of componentDidCatch.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No reporting service yet, so the console is the only place this is
    // visible. Wire an error reporter in here when there is one.
    console.error('Unhandled UI error', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (error === null) return this.props.children

    return (
      <StateBlock
        tone="error"
        title={this.props.title ?? 'Something went wrong on this page'}
        body={error.message}
        action={{ label: 'Try again', onClick: this.reset }}
      />
    )
  }
}
