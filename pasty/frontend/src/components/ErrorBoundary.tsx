import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center" role="alert">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Algo deu errado
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Ocorreu um erro inesperado. Tente recarregar a página ou volte mais tarde.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 cursor-pointer"
            >
              Recarregar página
            </button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 w-full max-w-md">
              <summary className="text-xs text-gray-400 cursor-pointer">Detalhes do erro</summary>
              <pre className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-red-600 dark:text-red-400 overflow-auto whitespace-pre-wrap">
                {this.state.error.message}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
