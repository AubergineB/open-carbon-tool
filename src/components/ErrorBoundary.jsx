import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 bg-error mx-auto mb-6 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-2xl">error</span>
            </div>
            <h1 className="font-headline text-2xl font-bold text-primary mb-3">
              Une erreur est survenue
            </h1>
            <p className="text-secondary text-sm mb-8 leading-relaxed">
              L'application a rencontré un problème inattendu. Vos données sauvegardées ne sont pas affectées.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary px-6 py-3 font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
